import {Composition} from 'remotion';
import {DURATION, LeaderboardTile} from './LeaderboardTile';
export const Root: React.FC = () => (
  <Composition id="LeaderboardTile" component={LeaderboardTile} width={1140} height={1140} fps={30} durationInFrames={DURATION} />
);
