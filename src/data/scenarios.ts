import { ScenarioData } from '../types/Scenario';

export const scenarios: ScenarioData[] = [
  {
    id: 'quarto',
    name: 'Quarto',
    icon: '🛏',
    order: 1,
    sounds: [
      {
        id: 'despertador',
        name: 'Despertador',
        article: 'o',
        description: 'O despertador toca de manhã para avisar que é hora de acordar.',
        file: require('../../assets/sounds/quarto/despertador.mp3'),
        softFile: require('../../assets/sounds/quarto/despertador_suave.mp3'),
      },
    ],
  },
  {
    id: 'sala',
    name: 'Sala',
    icon: '🛋',
    order: 2,
    sounds: [
      {
        id: 'televisao',
        name: 'Televisão',
        article: 'a',
        description: 'A televisão ligada na sala, com as vozes e as músicas dos programas.',
        file: require('../../assets/sounds/sala/televisao.mp3'),
        softFile: require('../../assets/sounds/sala/televisao_suave.mp3'),
      },
    ],
  },
  {
    id: 'cozinha',
    name: 'Cozinha',
    icon: '🥤',
    order: 3,
    sounds: [
      {
        id: 'liquidificador',
        name: 'Liquidificador',
        article: 'o',
        description: 'O liquidificador faz um barulho forte enquanto mistura o suco e para quando ele fica pronto.',
        file: require('../../assets/sounds/cozinha/liquidificador.mp3'),
        softFile: require('../../assets/sounds/cozinha/liquidificador_suave.mp3'),
      },
    ],
  },
  {
    id: 'parque',
    name: 'Parque',
    icon: '🌳',
    order: 4,
    sounds: [
      {
        id: 'criancas-brincando',
        name: 'Crianças brincando',
        article: 'as',
        description: 'Crianças rindo, correndo e conversando enquanto brincam no parque.',
        file: require('../../assets/sounds/parque/criancas_brincando.mp3'),
        softFile: require('../../assets/sounds/parque/criancas_brincando_suave.mp3'),
      },
    ],
  },
  {
    id: 'escola',
    name: 'Escola',
    icon: '🎓',
    order: 5,
    sounds: [
      {
        id: 'sinal',
        name: 'Sinal da escola',
        article: 'o',
        description: 'O sinal toca para avisar que o intervalo começou ou que ele acabou.',
        file: require('../../assets/sounds/escola/sinal.mp3'),
        softFile: require('../../assets/sounds/escola/sinal_suave.mp3'),
      },
    ],
  },
  {
    id: 'rua',
    name: 'Rua',
    icon: '🚗',
    order: 6,
    sounds: [
      {
        id: 'buzina',
        name: 'Buzina',
        article: 'a',
        description: 'A buzina dos carros que passam pela rua avisa que um carro está chegando.',
        file: require('../../assets/sounds/rua/buzina.mp3'),
        softFile: require('../../assets/sounds/rua/buzina_suave.mp3'),
      },
    ],
  },
];
