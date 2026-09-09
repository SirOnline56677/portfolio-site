import {Composition} from 'remotion';
import {DURATION, LeaderboardTile} from './LeaderboardTile';

// Two framings of the same shuffle. The square tile is the homepage card, where
// the page runs to the bottom edge. The wide one is the case study's opening
// figure, sized to the studies' 1024x661 figure slot: the page is scaled down
// and centred there so all six rank rows are readable, which a crop of the
// square could never do (it shows 736 of its 1140 rows, i.e. down to rank 2).
export const Root: React.FC = () => (
  <>
    <Composition id="LeaderboardTile" component={LeaderboardTile} width={1140} height={1140} fps={30} durationInFrames={DURATION} />
    <Composition
      id="LeaderboardTileWide"
      component={LeaderboardTile}
      width={1024}
      height={661}
      fps={30}
      durationInFrames={DURATION}
      defaultProps={{fit: 'contain' as const}}
    />
  </>
);
