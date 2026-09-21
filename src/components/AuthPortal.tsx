import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldAlert, UserRound, MapPin, Phone, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth, getSavedGeneralProfile } from '@/lib/auth';

export function AuthPortal() {
  const { signInGeneral, signInAdmin } = useAuth();
  const savedProfile = getSavedGeneralProfile();
  const [mode, setMode] = useState<'choose' | 'general' | 'admin'>(savedProfile ? 'general' : 'choose');
  const [name, setName] = useState(savedProfile?.name || '');
  const [phone, setPhone] = useState(savedProfile?.phone || '');
  const [district, setDistrict] = useState(savedProfile?.district || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submitGeneral = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !district.trim()) {
      setError('Please complete your name, phone number, and district.');
      return;
    }
    signInGeneral({ name: name.trim(), phone: phone.trim(), district: district.trim() });
  };

  const submitAdmin = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim() === 'admin' && password === 'admin@123') {
      signInAdmin();
      return;
    }
    setError('Administrator credentials are incorrect.');
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-white overflow-hidden relative flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,0.2),transparent_32%),radial-gradient(circle_at_86%_80%,rgba(16,185,129,0.16),transparent_30%)]" />
      <div className="relative w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] rounded-[28px] overflow-hidden border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">
        <section className="hidden lg:flex flex-col justify-between p-12 min-h-[650px] bg-gradient-to-br from-sky-500/20 via-transparent to-emerald-400/10 border-r border-white/10">
          <div>
            <div className="flex items-center gap-3 text-sm font-bold tracking-[0.24em] uppercase text-sky-300">
              <ShieldAlert className="h-7 w-7" /> SAHAYAK
            </div>
            <h1 className="mt-20 max-w-lg text-5xl font-black leading-[1.02] tracking-tight">One calm place for Nepal&apos;s emergency decisions.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-300">Stay informed as a citizen, or coordinate response operations with the full national intelligence workspace.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-md text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-emerald-300 font-bold">LIVE</p><p className="mt-1 text-slate-300">Weather, rivers & roads</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-sky-300 font-bold">SECURE</p><p className="mt-1 text-slate-300">Role-based workspaces</p></div>
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12 bg-slate-950/50 min-h-[650px] flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-sky-300 mb-10"><ShieldAlert className="h-6 w-6" /> SAHAYAK</div>
          {mode === 'choose' ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Emergency access portal</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">How are you joining today?</h2>
              <p className="mt-3 text-slate-400">Choose the workspace that matches your role.</p>
              <div className="mt-8 space-y-3">
                <button onClick={() => { setMode('general'); setError(''); }} className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.07] p-5 hover:bg-white/[0.12] hover:border-sky-400/60 transition-all group">
                  <div className="flex items-center gap-4"><span className="p-3 rounded-xl bg-sky-400/15 text-sky-300"><UserRound /></span><span className="flex-1"><strong className="block text-lg">General user</strong><small className="text-slate-400">Safety alerts, weather, roads and facilities</small></span><ArrowRight className="text-slate-500 group-hover:text-sky-300 transition-colors" /></div>
                </button>
                <button onClick={() => { setMode('admin'); setError(''); }} className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.07] p-5 hover:bg-white/[0.12] hover:border-emerald-400/60 transition-all group">
                  <div className="flex items-center gap-4"><span className="p-3 rounded-xl bg-emerald-400/15 text-emerald-300"><LockKeyhole /></span><span className="flex-1"><strong className="block text-lg">Administrator</strong><small className="text-slate-400">Full command, response and coordination tools</small></span><ArrowRight className="text-slate-500 group-hover:text-emerald-300 transition-colors" /></div>
                </button>
              </div>
            </>
          ) : mode === 'general' ? (
            <form onSubmit={submitGeneral}>
              <button type="button" onClick={() => setMode('choose')} className="text-xs text-slate-400 hover:text-white mb-7">← Choose another access type</button>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">General access</p>
              <h2 className="mt-3 text-3xl font-black">Create your safety profile</h2>
              <p className="mt-3 text-slate-400">Your details stay saved on this device for faster access next time.</p>
              <div className="mt-7 space-y-3">
                <label className="block"><span className="text-xs text-slate-400">Full name</span><div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3"><UserRound className="h-4 w-4 text-slate-500" /><input value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="Your name" /></div></label>
                <label className="block"><span className="text-xs text-slate-400">Phone number</span><div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3"><Phone className="h-4 w-4 text-slate-500" /><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="98XXXXXXXX" /></div></label>
                <label className="block"><span className="text-xs text-slate-400">District or city</span><div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3"><MapPin className="h-4 w-4 text-slate-500" /><input value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="Kathmandu" /></div></label>
              </div>
              {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
              <button className="mt-6 w-full rounded-xl bg-sky-500 py-3.5 font-bold text-slate-950 hover:bg-sky-400 transition-colors">Enter safety dashboard <ArrowRight className="inline ml-2 h-4 w-4" /></button>
            </form>
          ) : (
            <form onSubmit={submitAdmin}>
              <button type="button" onClick={() => setMode('choose')} className="text-xs text-slate-400 hover:text-white mb-7">← Choose another access type</button>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Restricted access</p>
              <h2 className="mt-3 text-3xl font-black">Administrator sign in</h2>
              <p className="mt-3 text-slate-400">Access the complete emergency command workspace.</p>
              <label className="block mt-7"><span className="text-xs text-slate-400">Username</span><div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3"><UserRound className="h-4 w-4 text-slate-500" /><input value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="Administrator username" autoComplete="username" /></div></label>
              <label className="block mt-3"><span className="text-xs text-slate-400">Password</span><div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3"><LockKeyhole className="h-4 w-4 text-slate-500" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent py-3 outline-none" placeholder="Administrator password" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
              {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
              <button className="mt-6 w-full rounded-xl bg-emerald-400 py-3.5 font-bold text-slate-950 hover:bg-emerald-300 transition-colors">Open command workspace <ArrowRight className="inline ml-2 h-4 w-4" /></button>
              <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Authorized administrators see all operational modules.</p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}