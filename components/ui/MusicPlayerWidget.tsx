import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import "./MusicPlayerWidget.css";

// Free, redistributable demo track (SoundHelix) — swap `src` for your own
// licensed audio. Title/artist below are placeholders, not a claim about
// what's actually playing.
const DEMO_TRACK = {
  title: "Sample Track",
  artist: "Demo Audio",
  //src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  src: "http://localhost/music/Subeme%20La%20Radio.mp3",
};

export function MusicPlayerWidget() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setIsPlaying(true);
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  const onVolumeChange = (val: number) => {
    const a = audioRef.current;
    setVolume(val);
    if (a) {
      a.volume = val;
      a.muted = val === 0;
    }
    setMuted(val === 0);
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="music-widget">
      <audio
        ref={audioRef}
        src={DEMO_TRACK.src}
        onEnded={() => setIsPlaying(false)}
        preload="none"
      />
      <button
        className="music-widget__play"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
      </button>

      <div className="music-widget__info">
        <span className="music-widget__title">{DEMO_TRACK.title}</span>
        <span className="music-widget__artist">{DEMO_TRACK.artist}</span>
      </div>

      <div className="music-widget__volume">
        <button className="music-widget__vol-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          <VolumeIcon size={15} />
        </button>
        <input
          className="music-widget__slider"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          style={{ "--fill": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
