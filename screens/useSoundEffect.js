import { useRef } from 'react';
import { Audio } from 'expo-av';

export default function useSoundEffect() {
  const soundRef = useRef(null);

  const play = async (type = 'send') => {
    let soundFile;
    if (type === 'send') soundFile = require('../assets/sfx/send.wav');
    else if (type === 'receive') soundFile = require('../assets/sfx/receive.wav');
    else if (type === 'pop') soundFile = require('../assets/sfx/pop.wav');
    if (!soundFile) return;
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(soundFile);
    soundRef.current = sound;
    await sound.playAsync();
  };

  return play;
}
