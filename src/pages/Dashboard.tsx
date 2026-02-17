import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Users, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import { GuestService } from '@/utils/guestData';

const createGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required'),
    description: z.string().optional(),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

export default function Dashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: groups, isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => {
            const isGuest = localStorage.getItem('guestMode') === 'true';
            if (isGuest) {
                return GuestService.getGroups();
            }
            const res = await api.get('/groups');
            return res.data;
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateGroupForm>({
        resolver: zodResolver(createGroupSchema),
    });

    const createGroupMutation = useMutation({
        mutationFn: async (data: CreateGroupForm) => {
            const isGuest = localStorage.getItem('guestMode') === 'true';
            if (isGuest) {
                return GuestService.createGroup(data);
            }
            const res = await api.post('/groups', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setIsDialogOpen(false);
            reset();
            toast({
                title: 'Group created',
                description: 'You can now add expenses to this group.',
            });
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Failed to create group',
                description: error.response?.data?.error || 'Something went wrong',
            });
        },
    });

    const onSubmit = (data: CreateGroupForm) => {
        createGroupMutation.mutate(data);
    };

    return (
        <div className="relative min-h-screen">
            <BackgroundDecorations />
            <div className="container mx-auto p-4 max-w-4xl relative z-10">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Manage your expense groups</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Group
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a new group</DialogTitle>
                                <DialogDescription>Add a name and description for your group.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Group Name</Label>
                                        <Input id="name" {...register('name')} placeholder="Trip to Paris" />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Input id="description" {...register('description')} placeholder="Expenses for the weekend trip" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createGroupMutation.isPending}>
                                        {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : groups?.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-gray-50/50 dark:bg-gray-800/20 backdrop-blur-sm">
                        <h3 className="text-lg font-medium">No groups yet</h3>
                        <p className="text-muted-foreground mt-2 mb-4">Create your first group to start splitting expenses.</p>
                        <Button onClick={() => setIsDialogOpen(true)}>Create Group</Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {groups?.map((group: any) => (
                            <Card key={group.id} className="hover:shadow-md transition-shadow bg-card/80 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex justify-between items-start">
                                        <span className="truncate">{group.name}</span>
                                    </CardTitle>
                                    <CardDescription className="line-clamp-1">{group.description || 'No description'}</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="mr-2 h-4 w-4" />
                                        {group.participants?.length || 0} participants
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button variant="ghost" className="w-full justify-between" asChild>
                                        <Link to={`/groups/${group.id}`}>
                                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
