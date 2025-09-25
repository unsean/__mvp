// App color palette (light theme) and gradients for Go-to-Resto
import darkColors from './darkColors';

export const colors = {
  primary: '#FF5722', // vivid orange-red accent
  secondary: '#FFD166',
  accent: '#06D6A0',
  background: '#FFFFFF', // pure white background
  surface: '#FAFAFA', // very light surface
  text: '#111111', // nearly black, high contrast
  muted: '#606060', // darker muted for readability
  error: '#D32F2F', // more visible error red
  success: '#388E3C', // stronger green
  info: '#1976D2', // more visible blue
  dark: '#111111',
  light: '#FFFFFF',
};

export const gradients = {
  main: ['#FF6F61', '#FFD166'],
  card: ['#FFFFFF', '#FFFAF0'],
  accent: ['#06D6A0', '#118AB2'],
  dark: ['#22223B', '#4A4E69'],
};

export { darkColors };

export default { colors, gradients };
