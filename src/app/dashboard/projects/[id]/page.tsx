"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';


export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const [res, authRes] = await Promise.all([
        axios.get(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setProject(res.data);
      if (authRes.ok) {
        const authData = await authRes.json();
        setUserRole(authData.data?.role || '');
      }
    } catch (error) {
      console.error('Failed to fetch project details', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (taskId: number, text: string) => {
    setCommentInputs({ ...commentInputs, [taskId]: text });
  };

  const submitComment = async (taskId: number) => {
    const text = commentInputs[taskId];
    if (!text?.trim()) return;

    setSubmitting(true);
    try {
      await axios.post(
        `/api/tasks/${taskId}/comments`,
        { content: text },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Comment added successfully');
      setCommentInputs({ ...commentInputs, [taskId]: '' });
      fetchProject(); // refresh to show new comment
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedTasks = React.useMemo(() => {
    if (!project?.tasks) return {};
    
    const groups: Record<string, any[]> = {};
    project.tasks.forEach((task: any) => {
      const dateKey = task.dueDate 
        ? new Date(task.dueDate).toLocaleDateString()
        : task.createdAt 
          ? new Date(task.createdAt).toLocaleDateString() 
          : 'No Date';
          
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });
    
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });

    const sortedGroups: Record<string, any[]> = {};
    sortedKeys.forEach(k => {
      sortedGroups[k] = groups[k];
    });

    return sortedGroups;
  }, [project?.tasks]);

  if (loading) return <div className="p-8">Loading project details...</div>;
  if (!project) return <div className="p-8">Project not found</div>;

  return (
    <div className="p-8 w-full max-w-[100vw] mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {project.image && (
                <img src={project.image.startsWith('http') ? project.image : project.image} alt={project.name} className="w-full h-40 object-cover rounded-md mb-4" />
              )}
              <p className="text-sm text-gray-500 mb-4">{project.description || 'No description provided.'}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
          {project.tasks && project.tasks.length > 0 ? (
            <Tabs defaultValue={Object.keys(groupedTasks)[0]} className="space-y-4">
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex w-max min-w-full justify-start h-auto p-1 bg-gray-100 rounded-lg">
                  {Object.keys(groupedTasks).map(date => (
                    <TabsTrigger 
                      key={date} 
                      value={date}
                      className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {date}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {Object.entries(groupedTasks).map(([date, tasks]) => (
                <TabsContent key={date} value={date} className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {tasks.map((task: any) => (
                    <Card key={task.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          </div>
                          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                            {task.status}
                          </Badge>
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center mt-4 text-sm">
                            <span className="text-gray-500 mr-2">Assigned to:</span>
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>{task.assignedTo.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{task.assignedTo.name}</span>
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-4 bg-white">
                        <h4 className="text-sm font-semibold flex items-center mb-4">
                          <MessageSquare className="w-4 h-4 mr-2" /> Comments ({task.comments?.length || 0})
                        </h4>
                        
                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                          {task.comments?.map((comment: any) => (
                            <div key={comment.id} className="flex space-x-3 bg-gray-50 p-3 rounded-lg">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{comment.user?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-semibold">{comment.user?.name}</h3>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          {(!task.comments || task.comments.length === 0) && (
                            <p className="text-sm text-gray-500 italic">No comments yet.</p>
                          )}
                        </div>

                        {userRole?.toLowerCase() === 'cto' && (
                          <div className="flex space-x-2 mt-4">
                            <Textarea 
                              placeholder="Add a comment to this task..."
                              className="min-h-[60px]"
                              value={commentInputs[task.id] || ''}
                              onChange={(e) => handleCommentChange(task.id, e.target.value)}
                            />
                            <Button 
                              className="h-auto"
                              disabled={submitting || !commentInputs[task.id]?.trim()}
                              onClick={() => submitComment(task.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No tasks available for this project.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
