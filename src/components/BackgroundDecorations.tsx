import React from 'react';

export default function BackgroundDecorations() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-[1]">
            {/* Top Right - Blue/Purple Blob */}
            <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl animate-float-slow opacity-60 mix-blend-multiply dark:mix-blend-normal dark:from-blue-500/10 dark:to-purple-500/10" />

            {/* Bottom Left - Teal/Indigo Blob */}
            <div className="absolute -bottom-[10%] -left-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-teal-400/20 to-indigo-500/20 blur-3xl animate-float-medium opacity-60 mix-blend-multiply dark:mix-blend-normal dark:from-teal-500/10 dark:to-indigo-500/10" />

            {/* Center Right - Small Floating Square (Rotated) */}
            <div className="absolute top-[40%] right-[15%] w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-400/10 to-rose-500/10 blur-xl animate-float-fast rotate-12 opacity-50 dark:from-pink-500/5 dark:to-rose-500/5 hidden lg:block" />

            {/* Top Left - Subtle Gradient Circle */}
            <div className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-500/15 blur-2xl animate-float-slow opacity-50 dark:from-cyan-500/5 dark:to-blue-500/5 hidden md:block" />

            {/* Mesh pattern overlay for texture (optional) */}
            <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-50/[0.02] bg-[bottom_1px_center]" />
        </div>
    );
}
