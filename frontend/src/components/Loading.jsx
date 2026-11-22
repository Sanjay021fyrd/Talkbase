import { LogoMark } from "./Logo";

const Loading = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <LogoMark className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-ink-400 text-sm tracking-wide">Loading TalkBase…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-ink-700 border-t-brand-400"></div>
    </div>
  );
};

export default Loading;
