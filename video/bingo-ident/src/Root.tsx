import {Composition} from 'remotion';
import {Slideshow} from './Slideshow';
export const Root: React.FC = () => (
  <>
    <Composition id="Square" component={Slideshow} width={1080} height={1080} fps={30} durationInFrames={300} defaultProps={{framesPerImage: 8}} />
    <Composition id="Vertical" component={Slideshow} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{framesPerImage: 8}} />
    <Composition id="Wide" component={Slideshow} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{framesPerImage: 8}} />
  </>
);
