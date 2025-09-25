// Animation helpers for Go-to-Resto
import * as Animatable from 'react-native-animatable';

export const fadeIn = {
  animation: 'fadeIn',
  duration: 400,
  easing: 'ease-in',
};

export const slideInUp = {
  animation: 'slideInUp',
  duration: 500,
  easing: 'ease-in-out',
};

export const bounce = {
  animation: 'bounceIn',
  duration: 700,
};

export { Animatable };
