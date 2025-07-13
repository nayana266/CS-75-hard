"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth } from '@/lib/firebaseConfig'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push('/')
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || (isSignUp ? 'Sign up failed' : 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create an account' : 'Login to your account'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Enter your email below to create your account' : 'Enter your email below to login to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : (isSignUp ? 'Sign up' : 'Login')}
                </Button>
                <Button variant="outline" className="w-full" type="button" disabled={loading} onClick={handleGoogleSignIn}>
                  {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : (isSignUp ? 'Sign up with Google' : 'Login with Google')}
                </Button>
              </div>
              {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
            </div>
            <div className="mt-4 text-center text-sm">
              {isSignUp ? (
                <>Already have an account?{' '}
                  <a href="#" className="underline underline-offset-4" onClick={e => { e.preventDefault(); setIsSignUp(false); }}>
                    Log in
                  </a>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <a href="#" className="underline underline-offset-4" onClick={e => { e.preventDefault(); setIsSignUp(true); }}>
                    Sign up
                  </a>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
