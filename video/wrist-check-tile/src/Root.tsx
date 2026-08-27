import {Composition} from 'remotion';
import {WristTile} from './WristTile';
export const Root: React.FC = () => (
  <Composition id="WristTile" component={WristTile} width={1140} height={1140} fps={30} durationInFrames={88} />
);
