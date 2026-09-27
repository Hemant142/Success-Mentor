import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col gap-4 mt-12 max-w-5xl mx-auto px-4">
      <div className="h-[70px] bg-slate-200 animate-pulse rounded-md" />
      <div className="h-[70px] bg-slate-200 animate-pulse rounded-md" />
      <div className="h-[70px] bg-slate-200 animate-pulse rounded-md" />
      <div className="h-[70px] bg-slate-200 animate-pulse rounded-md" />
      <div className="h-[70px] bg-slate-200 animate-pulse rounded-md" />
      <div className="h-[70px] bg-slate-200 animate-pulse rounded-md" />
      <div className="h-[70px] bg-slate-200 animate-pulse rounded-md" />
    </div>
  );
};

export default Loading;