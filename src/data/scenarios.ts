import { Scenario } from '../types/Scenario';

export const scenarios: Scenario[] = [
  {
    id: 'quarto',
    name: 'Quarto',
    icon: '🛏',
    order: 1,
    status: 'completed',
    sounds: [
      {
        id: 'alarme',
        name: 'teclado',
        description: 'O som das teclas de um teclado de computador sendo digitado.',
        file: require('../../assets/sounds/quarto/teclado.mp3'),
        softFile: require('../../assets/sounds/quarto/teclado.mp3'),
      },
    ],
  },
  {
    id: 'sala',
    name: 'Sala',
    icon: '🛋',
    order: 2,
    status: 'completed',
    sounds: [
      {
        id: 'tv',
        name: 'Televisão',
        description: 'O som da televisão ligada na sala de estar.',
        file: require('../../assets/sounds/sala/tv.mp3'),
        softFile: require('../../assets/sounds/sala/tv_suave.mp3'),
      },
    ],
  },
  {
    id: 'parque',
    name: 'Parque',
    icon: '🌳',
    order: 3,
    status: 'unlocked',
    sounds: [
      {
        id: 'passaros',
        name: 'Pássaros',
        description: 'O canto dos pássaros que se ouve no parque.',
        file: require('../../assets/sounds/parque/passaros.mp3'),
        softFile: require('../../assets/sounds/parque/passaros_suave.mp3'),
      },
    ],
  },
  {
    id: 'escola',
    name: 'Escola',
    icon: '🎓',
    order: 4,
    status: 'locked',
    sounds: [
      {
        id: 'sinal',
        name: 'Sinal da escola',
        description: 'O sinal que toca para anunciar o intervalo na escola.',
        file: require('../../assets/sounds/escola/sinal.mp3'),
        softFile: require('../../assets/sounds/escola/sinal_suave.mp3'),
      },
    ],
  },
  {
    id: 'rua',
    name: 'Rua',
    icon: '🚗',
    order: 5,
    status: 'locked',
    sounds: [
      {
        id: 'buzina',
        name: 'Buzina',
        description: 'A buzina dos carros que passam pela rua.',
        file: require('../../assets/sounds/rua/buzina.mp3'),
        softFile: require('../../assets/sounds/rua/buzina_suave.mp3'),
      },
    ],
  },
];
