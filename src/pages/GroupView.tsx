import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, ArrowLeft, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { GuestService } from '@/utils/guestData';

const addParticipantSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
});

type AddParticipantForm = z.infer<typeof addParticipantSchema>;

export default function GroupView() {
    const { id } = useParams();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);

    const { data: group, isLoading: groupLoading } = useQuery({
        queryKey: ['group', id],
        queryFn: async () => {
            const isGuest = localStorage.getItem('guestMode') === 'true';
            if (isGuest && id) {
                return GuestService.getGroup(id);
            }
            const res = await api.get(`/groups/${id}`);
            return res.data;
        },
    });

    const { data: balancesData, isLoading: balancesLoading } = useQuery({
        queryKey: ['balances', id],
        queryFn: async () => {
            const isGuest = localStorage.getItem('guestMode') === 'true';
            if (isGuest && id) {
                return GuestService.getBalances(id);
            }
            const res = await api.get(`/balances/${id}`);
            return res.data;
        },
    });

    const addParticipantMutation = useMutation({
        mutationFn: async (data: AddParticipantForm) => {
            const isGuest = localStorage.getItem('guestMode') === 'true';
            if (isGuest && id) {
                return GuestService.addParticipant(id, data);
            }
            const res = await api.post(`/groups/${id}/participants`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group', id] });
            setIsParticipantDialogOpen(false);
            participantForm.reset();
            toast({ title: 'Participant added' });
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.error || 'Failed to add participant',
            });
        },
    });

    const participantForm = useForm<AddParticipantForm>({
        resolver: zodResolver(addParticipantSchema),
    });

    const onAddParticipant = (data: AddParticipantForm) => {
        addParticipantMutation.mutate(data);
    };

    if (groupLoading || balancesLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!group) return <div className="p-8 text-center">Group not found</div>;

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="mb-6">
                <Link to="/" className="text-sm text-muted-foreground hover:underline flex items-center mb-2">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                        <p className="text-muted-foreground">{group.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <UserPlus className="h-4 w-4 mr-2" /> Add Person
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Participant</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={participantForm.handleSubmit(onAddParticipant)} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="part-name">Name</Label>
                                        <Input id="part-name" {...participantForm.register('name')} placeholder="Name" />
                                        {participantForm.formState.errors.name && <p className="text-red-500 text-sm">{participantForm.formState.errors.name.message}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="part-email">Email (Optional)</Label>
                                        <Input id="part-email" {...participantForm.register('email')} placeholder="email@example.com (links to user)" />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={addParticipantMutation.isPending}>Add</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <AddExpenseDialog groupId={id!} participants={group.participants} />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content: Expenses List */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {group.expenses?.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No expenses yet.</div>
                            ) : (
                                <div className="space-y-4">
                                    {group.expenses?.map((expense: any) => (
                                        <div key={expense.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-muted p-2 rounded-full">
                                                    <Receipt className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{expense.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Paid by <span className="font-medium text-foreground">{expense.payer.name}</span> • {format(new Date(expense.date), 'MMM d')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">${Number(expense.amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Balances & Participants */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Balances</CardTitle>
                            <CardDescription>Suggested settlements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {balancesData?.settlements?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Everyone is settled up!</p>
                            ) : (
                                <ul className="space-y-3">
                                    {balancesData?.settlements?.map((s: any, idx: number) => {
                                        const fromName = group.participants.find((p: any) => p.id === s.from)?.name || 'Unknown';
                                        const toName = group.participants.find((p: any) => p.id === s.to)?.name || 'Unknown';
                                        return (
                                            <li key={idx} className="text-sm border-l-2 border-green-500 pl-3 py-1">
                                                <span className="font-medium">{fromName}</span> owes <span className="font-medium">{toName}</span> <span className="font-bold text-green-600">${s.amount}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Participants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {group.participants?.map((p: any) => (
                                    <div key={p.id} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                                        {p.name}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
