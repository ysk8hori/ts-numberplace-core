/** ナンプレ問題を解く機能と作成する機能をシンプルに提供する */

import 'reflect-metadata';
import { container } from 'tsyringe';
import CellRepository from '@/core/repository/cellRepository';
import CellRepositoryImpl from '@/repository/cellRepositoryImpl';
import GroupRepository from '@/core/repository/groupRepository';
import GroupRepositoryImpl from '@/repository/groupRepositoryImpl';
import GameRepository from '@/core/repository/gameRepository';
import GameRepositoryImpl from '@/repository/gameRepositoryImpl';
import CreateGoodGameLogic from './core/logic/create/createGoodGameLogic';
import InfiniteAnalyzeLogic from './core/logic/analyze/infiniteAnalyze/infiniteAnalyzeLogic';
import BaseHeight from './core/valueobject/baseHeight';
import BaseWidth from './core/valueobject/baseWidth';
import GameID from './core/valueobject/gameId';

const cellRepository = CellRepositoryImpl.create();
const groupRepository = GroupRepositoryImpl.create();
const gameRepository = GameRepositoryImpl.create();

container.register<CellRepository>('CellRepository', {
  useValue: cellRepository,
});
container.register<GroupRepository>('GroupRepository', {
  useValue: groupRepository,
});
container.register<GameRepository>('GameRepository', {
  useValue: gameRepository,
});

type Game = {
  cells: Cell[];
};

type Cell = {
  pos: Position;
  answer: undefined | string;
};

type Position = Readonly<[number, number]>;

export function createGame(blockSize: BlockSize) {
  const gameId = CreateGoodGameLogic.create(
    BaseHeight.create(blockSize.height),
    BaseWidth.create(blockSize.width),
  ).execute();

  const pazzules: Game = convert(gameId);
  InfiniteAnalyzeLogic.createAndExecute(gameId);
  const corrected: Game = convert(gameId);
  cellRepository.remove(gameId);
  groupRepository.remove(gameId);
  gameRepository.remove(gameId);
  return [pazzules, corrected];

  function convert(gameId: GameID): Game {
    return {
      cells: cellRepository.findAll(gameId).map(cell => ({
        pos: [
          cell.position.horizontalPosition.value,
          cell.position.verticalPosition.value,
        ],
        answer: cell.answer?.value,
      })),
    };
  }
}

// export function isCollect(game: Game): boolean {}

type BlockSize = {
  width: number;
  height: number;
};
