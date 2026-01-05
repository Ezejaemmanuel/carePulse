'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, easeOut, easeInOut } from 'framer-motion';

interface Scene {
  timestamp: number;
  cue: string;
  prompt: string;
  transition: string;
  motion: string;
  backgroundColor: string;
}

// Define all scenes with precise timestamps in seconds (including milliseconds)
const scenes: Scene[] = [
  {
    timestamp: 0.00,
    cue: 'Initial Strum',
    prompt: 'Close-up of acoustic guitar strings vibrating in slow motion, golden sunlight.',
    transition: 'Fade from Black (0.5s)',
    motion: 'Slow Zoom',
    backgroundColor: '#f7f3e9'
  },
  {
    timestamp: 7.42,
    cue: 'First Heavy Kick',
    prompt: 'A beautiful African mother laughing, wearing a bright yellow headscarf, blurred village background.',
    transition: 'Hard Cut',
    motion: '105% Scale Bump (Pulse)',
    backgroundColor: '#e8f4fd'
  },
  {
    timestamp: 14.28,
    cue: 'Verse Start',
    prompt: 'Silhouette of a woman carrying a water pot at sunrise, high contrast orange sky.',
    transition: 'Hard Cut',
    motion: 'Slow Pan Right',
    backgroundColor: '#f0e6ff'
  },
  {
    timestamp: 18.85,
    cue: 'Percussion Fill',
    prompt: 'Close-up of traditional talking drums (Gangan) being played by rhythmic hands.',
    transition: 'Quick Zoom Blur',
    motion: 'Shake on the hit',
    backgroundColor: '#fff2e8'
  },
  {
    timestamp: 22.85,
    cue: '"Food already done"',
    prompt: 'Steam rising from a colorful bowl of Jollof rice and plantain on a wooden table.',
    transition: 'Hard Cut',
    motion: 'Slow Pan Down',
    backgroundColor: '#ffe8e8'
  },
  {
    timestamp: 28.57,
    cue: 'CHORUS DROP',
    prompt: 'A wide, cinematic shot of a community dancing together under a massive Baobab tree.',
    transition: 'Flash White (1 frame) + Hard Cut',
    motion: 'Fast Zoom In',
    backgroundColor: '#e8fff2'
  },
  {
    timestamp: 33.14,
    cue: '"Mama Mary" (Vocals)',
    prompt: 'A portrait of the mother looking directly at the camera with a saint-like glow/halo.',
    transition: 'Hard Cut',
    motion: 'Subtle Scale Up',
    backgroundColor: '#fffbe8'
  },
  {
    timestamp: 37.71,
    cue: 'Secondary Kick',
    prompt: 'A young man (the artist) singing with eyes closed, hand on chest, emotional expression.',
    transition: 'Hard Cut',
    motion: '5-degree Camera Tilt',
    backgroundColor: '#f0f8ff'
  },
  {
    timestamp: 41.14,
    cue: '"Turn to Gold"',
    prompt: 'Abstract liquid gold splashing and forming the shape of a heart, black background.',
    transition: 'Light Leak Overlay',
    motion: 'Fast Rotation',
    backgroundColor: '#f5f0e8'
  },
  {
    timestamp: 50.28,
    cue: 'Guitar Solo / Bridge',
    prompt: 'An artistic sketch of a mother and child drawn in golden ink lines on dark parchment.',
    transition: 'Hard Cut',
    motion: 'Slow Zoom Out',
    backgroundColor: '#f0f0f0'
  }
];

export default function TestingSync() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastCheckedTimeRef = useRef(0);

  // Audio time update handler with scene synchronization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const newTime = audio.currentTime;
      setCurrentTime(newTime);

      // Check for scene changes
      const nextScene = scenes[currentSceneIndex + 1];
      if (nextScene && newTime >= nextScene.timestamp && newTime > lastCheckedTimeRef.current) {
        setCurrentSceneIndex(prevIndex => prevIndex + 1);
        lastCheckedTimeRef.current = newTime;
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, [currentSceneIndex]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentSceneIndex(0);
      setCurrentTime(0);
    }
  };

  const currentScene = scenes[currentSceneIndex];

  // Animation variants for different transitions
  const getSceneVariants = (scene: Scene) => {
    switch (scene.transition) {
      case 'Fade from Black (0.5s)':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5 }
        };
      case 'Hard Cut':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.1 }
        };
      case 'Quick Zoom Blur':
        return {
          initial: { scale: 0.7, filter: 'blur(6px)' },
          animate: { scale: 1, filter: 'blur(0px)' },
          transition: { duration: 0.3 }
        };
      case 'Light Leak Overlay':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 1 }
        };
      case 'Flash White (1 frame) + Hard Cut':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.1 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5 }
        };
    }
  };

  const getMotionVariants = (scene: Scene, currentTime: number) => {
    const timeSinceSceneStart = currentTime - scene.timestamp;

    switch (scene.motion) {
      case 'Slow Zoom':
        return {
          initial: { scale: 0.9 },
          animate: { scale: 1 },
          transition: { duration: 2, ease: easeOut }
        };
      case '105% Scale Bump (Pulse)':
        // Start at 0:07.10 (7.10s), reach 110% at 0:07.42 (7.42s) - 0.32s duration
        const scaleProgress = Math.max(0, Math.min(1, (timeSinceSceneStart + 0.32) / 0.32));
        return {
          scale: 1 + (0.1 * scaleProgress),
          transition: { duration: 0.01 } // Instant update
        };
      case 'Slow Pan Right':
        // Start sliding from left at 0:13.90, lock center at 0:14.28 - 0.38s duration
        const panProgress = Math.max(0, Math.min(1, (timeSinceSceneStart + 0.38) / 0.38));
        return {
          x: `${-5 + (10 * panProgress)}%`,
          transition: { duration: 0.01 } // Instant update
        };
      case 'Shake on the hit':
        return {
          initial: { x: 0 },
          animate: { x: [0, -3, 3, -3, 3, 0] },
          transition: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
        };
      case 'Slow Pan Down':
        return {
          initial: { y: '-5%' },
          animate: { y: '5%' },
          transition: { duration: 1.5, ease: easeInOut }
        };
      case 'Fast Zoom In':
        // Start at 0:28.20, reach max brightness at 0:28.57, then hard cut - 0.37s duration
        const bloomProgress = Math.max(0, Math.min(1, (timeSinceSceneStart + 0.37) / 0.37));
        return {
          initial: { scale: 0.8, filter: 'brightness(1)' },
          animate: {
            scale: 0.8 + (0.4 * bloomProgress),
            filter: `brightness(${1 + bloomProgress})`
          },
          transition: { duration: 0.01 } // Instant update
        };
      case 'Subtle Scale Up':
        // Start slow zoom at 0:40.50, stop at 0:41.14 - 0.64s duration
        const pushProgress = Math.max(0, Math.min(1, (timeSinceSceneStart + 0.64) / 0.64));
        return {
          scale: 1 + (0.1 * pushProgress),
          transition: { duration: 0.01 } // Instant update
        };
      case '5-degree Camera Tilt':
        return {
          initial: { rotate: 0 },
          animate: { rotate: 5 },
          transition: { duration: 0.6, ease: easeOut }
        };
      case 'Fast Rotation':
        return {
          initial: { rotate: 0 },
          animate: { rotate: 360 },
          transition: { duration: 0.8, ease: easeOut }
        };
      case 'Slow Zoom Out':
        return {
          initial: { scale: 1.1 },
          animate: { scale: 1 },
          transition: { duration: 2, ease: easeOut }
        };
      default:
        return {};
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src="https://musicfile.api.box/YWEzZjBmYzEtZGYwMy00NDhjLThkY2MtODE2OGI5YmVhZGUy.mp3"
        preload="auto"
      />

      {/* Controls */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Restart
        </button>
      </div>

      {/* Time Display */}
      <div className="absolute top-4 right-4 z-50 text-white bg-black bg-opacity-50 px-3 py-1 rounded font-mono">
        {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 100).toString().padStart(2, '0')}
      </div>

      {/* Scene Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSceneIndex}
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: currentScene.backgroundColor }}
          {...getSceneVariants(currentScene)}
        >
          <motion.div
            className="text-center p-8 max-w-4xl"
            {...getMotionVariants(currentScene, currentTime)}
          >
            <motion.h1
              className="text-2xl md:text-4xl font-bold mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {currentScene.cue}
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-700 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {currentScene.prompt}
            </motion.p>

            <motion.div
              className="mt-6 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <p>Transition: {currentScene.transition}</p>
              {currentScene.motion && <p>Motion: {currentScene.motion}</p>}
              <p>Timestamp: {Math.floor(currentScene.timestamp / 60)}:{(Math.floor(currentScene.timestamp % 60)).toString().padStart(2, '0')}.{Math.floor((currentScene.timestamp % 1) * 100).toString().padStart(2, '0')}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Scene Timeline */}
      <div className="absolute bottom-4 left-4 right-4 z-50 bg-black bg-opacity-50 p-4 rounded">
        <div className="flex gap-2 overflow-x-auto">
          {scenes.map((scene, index) => (
            <div
              key={index}
              className={`flex-shrink-0 px-3 py-1 rounded text-xs ${
                index === currentSceneIndex
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {Math.floor(scene.timestamp / 60)}:{(Math.floor(scene.timestamp % 60)).toString().padStart(2, '0')}.{Math.floor((scene.timestamp % 1) * 100).toString().padStart(2, '0')} - {scene.cue}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}