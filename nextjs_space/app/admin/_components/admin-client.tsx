'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, CheckCircle, Unlock, Shield, Clock,
  Edit, Trash2, Plus, X, Save, ChevronDown, ChevronUp, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { toast } from 'sonner';
import AuditLogs from './audit-logs'; // <-- Added our new component!

// Import Firebase auth tools
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type Tab = 'overview' | 'users' | 'lessons' | 'logs'; // <-- Added 'logs' to the tabs

// Replace this with your actual admin email
const ADMIN_EMAIL = 'brandonmwanzia@gmail.com';

export default function AdminClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      } else if (currentUser.email !== ADMIN_EMAIL) {
        // Boot non-admins back to the dashboard
        router.replace('/dashboard');
      } else {
        setUser(currentUser);
        loadMockAdminData();
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Safe fallback data since the old Prisma API was removed
  const loadMockAdminData = () => {
    setStats({
      userCount: 42,
      lessonCount: 18,
      completionCount: 156,
      unlockCount: 24,
      recentUsers: [
        { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() }
      ],
      recentCompletions: [
        { id: '1', user: { name: 'John Doe' }, lesson: { title: 'What is a Budget?' }, completedAt: new Date().toISOString() }
      ]
    });
    
    setUsers([
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'LEARNER', _count: { progress: 4, moduleAccess: 1 }, createdAt: new Date().toISOString() }
    ]);
    
    setLessons([
      { id: 'les-1', title: 'What is a Budget?', module: { title: 'The Basics', track: { title: 'Personal Finance' } }, sortOrder: 1 }
    ]);
    
    setLoading(false);
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    
    // Simulate delete request
    setLessons((prev) => (prev ?? []).filter((l: any) => l?.id !== id));
    toast.success('Lesson deleted successfully');
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    const isNew = !editingLesson?.id;
    
    // Simulate save request
    const saved = { ...editingLesson, id: isNew ? `les-new-${Math.random()}` : editingLesson.id };
    
    if (isNew) {
      setLessons((prev) => [...(prev ?? []), saved]);
    } else {
      setLessons((prev) => (prev ?? []).map((l: any) => l?.id === saved?.id ? { ...l, ...saved } : l));
    }
    
    setEditingLesson(null);
    toast.success(isNew ? 'Lesson created' : 'Lesson updated');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold tracking-tight">Admin Panel</h1>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-2">
          {(['overview', 'users', 'lessons', 'logs'] as Tab[]).map((t) => (
            <Button
              key={t}
              variant={tab === t ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { icon: Users, label: 'Total Users', value: stats?.userCount ?? 0, color: '#10B981' },
                { icon: BookOpen, label: 'Total Lessons', value: stats?.lessonCount ?? 0, color: '#3B82F6' },
                { icon: CheckCircle, label: 'Completions', value: stats?.completionCount ?? 0, color: '#8B5CF6' },
                { icon: Unlock, label: 'Module Unlocks', value: stats?.unlockCount ?? 0, color: '#F59E0B' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl bg-card p-5"
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="font-display text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-card p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                <h3 className="font-display font-semibold mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {(stats?.recentUsers ?? []).map((u: any) => (
                    <div key={u?.id ?? Math.random()} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{u?.name ?? 'User'}</p>
                        <p className="text-xs text-muted-foreground">{u?.email ?? ''}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-card p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                <h3 className="font-display font-semibold mb-4">Recent Completions</h3>
                <div className="space-y-3">
                  {(stats?.recentCompletions ?? []).slice(0, 5).map((c: any, i: number) => (
                    <div key={c?.id ?? i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{c?.user?.name ?? 'User'}</p>
                        <p className="text-xs text-muted-foreground">{c?.lesson?.title ?? 'Lesson'}</p>
                      </div>
                      <div className="text-right">
                        {c?.quizScore != null && (
                          <p className="text-xs font-mono">{c.quizScore}/{c.quizTotal}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {c?.completedAt ? new Date(c.completedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="rounded-xl bg-card p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h3 className="font-display font-semibold mb-4">All Users ({users?.length ?? 0})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Lessons</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Unlocks</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(users ?? []).map((u: any) => (
                    <tr key={u?.id ?? Math.random()} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-2 font-medium">{u?.name ?? 'User'}</td>
                      <td className="py-3 px-2 text-muted-foreground">{u?.email ?? ''}</td>
                      <td className="py-3 px-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u?.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {u?.role ?? 'LEARNER'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono">{u?._count?.progress ?? 0}</td>
                      <td className="py-3 px-2 font-mono">{u?._count?.moduleAccess ?? 0}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lessons */}
        {tab === 'lessons' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">All Lessons ({lessons?.length ?? 0})</h3>
              <Button size="sm" className="gap-2" onClick={() => setEditingLesson({ title: '', hook: '', content: '', moduleId: '', quizData: '[]', sortOrder: 0 })}>
                <Plus className="h-4 w-4" /> New Lesson
              </Button>
            </div>

            {/* Edit modal */}
            {editingLesson && (
              <div className="mb-6 rounded-xl bg-card p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">{editingLesson?.id ? 'Edit Lesson' : 'New Lesson'}</h4>
                  <Button variant="ghost" size="sm" onClick={() => setEditingLesson(null)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingLesson?.title ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingLesson({ ...(editingLesson ?? {}), title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Module ID</Label>
                    <Input
                      value={editingLesson?.moduleId ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingLesson({ ...(editingLesson ?? {}), moduleId: e.target.value })}
                      className="mt-1"
                      placeholder="e.g. mod-pf-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Hook</Label>
                    <textarea
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                      value={editingLesson?.hook ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingLesson({ ...(editingLesson ?? {}), hook: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Content (Markdown)</Label>
                    <textarea
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px] font-mono text-xs"
                      value={editingLesson?.content ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingLesson({ ...(editingLesson ?? {}), content: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Quiz Data (JSON)</Label>
                    <textarea
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] font-mono text-xs"
                      value={editingLesson?.quizData ?? '[]'}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingLesson({ ...(editingLesson ?? {}), quizData: e.target.value })}
                    />
                  </div>
                </div>
                <Button className="mt-4 gap-2" onClick={handleSaveLesson}>
                  <Save className="h-4 w-4" /> Save Lesson
                </Button>
              </div>
            )}

            <div className="rounded-xl bg-card" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Module</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Track</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lessons ?? []).map((l: any) => (
                      <tr key={l?.id ?? Math.random()} className="border-b border-border/50 last:border-0">
                        <td className="py-3 px-4 font-medium">{l?.title ?? 'Lesson'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{l?.module?.title ?? '-'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{l?.module?.track?.title ?? '-'}</td>
                        <td className="py-3 px-4 font-mono">{l?.sortOrder ?? 0}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingLesson(l)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteLesson(l?.id ?? '')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* API Audit Logs */}
        {tab === 'logs' && (
          <div className="space-y-4">
            <AuditLogs />
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}