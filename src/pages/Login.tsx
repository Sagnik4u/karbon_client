import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', data);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.removeItem('guestMode'); // Clear guest mode if user logs in
            navigate('/');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login failed',
                description: error.response?.data?.error || 'Something went wrong',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipAuth = () => {
        localStorage.setItem('guestMode', 'true');
        localStorage.setItem('user', JSON.stringify({
            id: 'guest',
            email: 'guest@splitmint.app',
            name: 'Guest User'
        }));
        toast({
            title: 'Guest Mode',
            description: 'You are using SplitMint as a guest. Data will not be saved.',
        });
        navigate('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Login to your account to manage expenses</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                        <Button
                            className="w-full"
                            type="button"
                            variant="outline"
                            onClick={handleSkipAuth}
                        >
                            Continue as Guest
                        </Button>
                        <div className="text-sm text-center text-gray-500">
                            Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
