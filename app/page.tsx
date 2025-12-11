import LogIn from './login';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
            <LogIn />
            <div className="mt-4 flex flex-col items-center gap-2 text-sm text-blue-600">
                <Link href="/signup" className="hover:text-blue-700">Don&apos;t have an account? Sign Up</Link>
                <Link href="/reset" className="hover:text-blue-700">Forgot Password?</Link>
            </div>
        </main>
    );
}
