import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import './Player.scss';
import gsap from 'gsap';
import { bindActionCreators } from 'redux';
import { playerUpdate, uiUpdate } from '../redux/actions';
import FastAverageColor from 'fast-average-color';
import invert from 'invert-color';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import { fetchAlbum, AUTOPLAY_FIRST, AUTOPLAY_LAST, SongPlayerIframe, fetchSearch } from '../redux/api';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
function Iframe(props) {
  return <div dangerouslySetInnerHTML={{ __html: props ? props : '' }} />;
}
export class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      img: '',
      albumText: '',
      available: true
    };
    this.play = this.play.bind(this);
    this.playNext = this.playNext.bind(this);
    this.playPrevious = this.playPrevious.bind(this);
    this.stop = this.stop.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.albumback = this.albumback.bind(this);
    this.resize = this.resize.bind(this);
    this.onResize = this.onResize.bind(this);
    this.keyDetector = this.keyDetector.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.data = {};
  }
  componentDidMount() {
    const { vinylContent, onResize, keyDetector, TheStylus } = this;
    const cr = this.c.r.baseVal.value;
    const cx = Math.round((this.c.cx.baseVal.value / 90) * 100) - cr * 4;
    const cy = Math.round((this.c.cy.baseVal.value / 345) * 100);
    this.SOrigin = `${cx}% ${cy}%`;
    this.spin = gsap.to(vinylContent, 3, { rotation: 360, repeat: -1, ease: 'none' }).pause(0);
    this.wiggle = gsap
      .fromTo(
        TheStylus,
        0.2,
        { transformOrigin: this.SOrigin, rotation: 15 },
        { transformOrigin: this.SOrigin, rotation: 14.8, yoyo: true, ease: 'none', repeat: -1 }
      )
      .pause(0);
    this.resizeTimeOut = setTimeout(() => this.resize(), 500);
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', keyDetector, false);
  }
  componentWillUnmount() {
    const { onResize, keyDetector } = this;
    window.removeEventListener('resize', onResize);
    document.addEventListener('keydown', keyDetector, false);
  }
  keyDetector(event) {
    const { keyCode } = event;
    const { playPrevious, playNext, resume, stop } = this;
    const { isPlaying } = this.props.data;
    if (!this.props.isInit) return;
    if (this.isTyping) return;
    if (keyCode === 32 || keyCode === 75) {
      //stop or play
      if (isPlaying) {
        stop();
      } else {
        resume();
      }
    } else if (keyCode === 37 || keyCode === 74) {
      //left
      playPrevious();
    } else if (keyCode === 39 || keyCode === 76) {
      //right
      playNext();
    }
  }
  onResize() {
    clearTimeout(this.resizeTimeOut);
    this.resizeTimeOut = setTimeout(() => this.resize(), 500);
  }
  resize() {
    const { img, vinylContent, thealbum, TheStylus, ref, middle, panel, bottom } = this;
    const w = ref.offsetWidth;
    const h = ref.offsetHeight;
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const preSize = w * 0.3;
    const size = preSize > h ? (h * 1) / 2 : preSize;
    this.size = size;
    gsap
      .timeline()
      .add('playerResize')
      .to(bottom, { width: size + 40 + size + 15, left: w / 2 - size - size / 8, bottom: vh*0.05 }, 'playerResize')
      .to([img, TheStylus], { width: size, height: size }, 'playerResize')
      .to('.vinyl', { width: size - 10, height: size - 10, left: w / 2 - size + 5 - size / 8, top: h / 2 - (size * 2) / 3 + 5 }, 'playerResize')
      .to([thealbum, TheStylus, panel], { left: w / 2 - size - size / 8, top: h / 2 - (size * 2) / 3 }, 'playerResize')
      .to(panel, { width: size + 40, height: size, x: size + 10 }, 'playerResize')
      .to('.vinyl', { opacity: 1, x: size + 15 }, 'playerResize')
      .to(TheStylus, { x: size + size / 2 }, 'playerResize')
      .to(middle, { fontSize: size * 0.01 }, 'playerResize')
      .to(vinylContent, { width: size * 0.3, height: size * 0.3 }, 'playerResize')
      .to('.middle', { width: size * 0.3 - 34, height: size * 0.3 - 34 }, 'playerResize');
  }
  componentDidUpdate(prevProps) {
    const { data } = this.props;
    const { id } = data;
    if (this.data.id !== id) {
      this.play(data);
    }
  }
  stop() {
    const { playerUpdate } = this.props;
    const { spinDom, TheStylus } = this;
    clearTimeout(this.playNextTimeOut);
    ReactDOM.render(Iframe(''), this.hiddenPlayer);
    this.spin.pause(0);
    this.wiggle.pause(0);
    gsap.set(spinDom, { className: 'spin' });
    gsap.to(TheStylus, {
      transformOrigin: this.SOrigin,
      rotation: 0
    });
    playerUpdate({ index: 0, isPlaying: false });
  }
  pause() {
    const { spinDom, spin, hiddenPlayer, wiggle } = this;
    clearTimeout(this.playNextTimeOut);
    ReactDOM.render(Iframe(''), hiddenPlayer);
    spin.pause();
    wiggle.pause();
    gsap.set(spinDom, { className: 'spin' });
  }
  playNext() {
    const { trackList, data, playerUpdate, fetchAlbum, next, kind, albumID } = this.props;
    const nextIndex = data.index + 1;
    if (trackList.length > nextIndex) {
      playerUpdate({
        ...trackList[nextIndex],
        index: nextIndex
      });
    } else {
      fetchAlbum(albumID, kind, next, AUTOPLAY_FIRST);
    }
  }
  playPrevious() {
    const { trackList, data, playerUpdate, fetchAlbum, previous, kind, albumID, total } = this.props;
    const nextIndex = data.index - 1;
    if (nextIndex >= 0) {
      playerUpdate({ ...trackList[nextIndex], index: nextIndex });
    } else {
      fetchAlbum(albumID, kind, previous, AUTOPLAY_LAST, total - 15);
    }
  }
  resume() {
    const { playerUpdate } = this.props;
    const { data, spinDom, TheStylus } = this;
    const available = data.available_territories.includes('TW');
    if (data && available) {
      gsap.to(TheStylus, {
        transformOrigin: this.SOrigin,
        rotation: 15,
        onComplete: () => {
          this.spin.play();
          this.wiggle.play();
          gsap.set(spinDom, { className: 'spin play' });
          const ift = SongPlayerIframe(data.id);
          const iframe = Iframe(ift);
          this.hiddenIframe = iframe;
          ReactDOM.render(iframe, this.hiddenPlayer);
          clearTimeout(this.playNextTimeOut);
          this.playNextTimeOut = setTimeout(() => this.playNext(), 30000);
          playerUpdate({ isPlaying: true });
          this.isBusy = false;
        }
      });
    } else if (!available) {
      this.stop();
      playerUpdate({ isPlaying: false });
    }
  }
  albumback() {
    const { data, thealbum, spin, hiddenPlayer, playNext, spinDom, TheStylus, wiggle, props, size, stop } = this;
    const { isPlaying, available_territories } = data;
    const { uiUpdate, isInit } = props;
    this.albumBackAnumate = gsap
      .timeline()
      .add('albumback')
      .to(thealbum, 0.25, { delay: 0.25, y: 0, opacity: 1 }, 'albumback')
      .add('vinylOut')
      .to(
        '.vinyl',
        {
          opacity: 1,
          x: size + 15,
          onComplete: () => {
            const available = available_territories.includes('TW');
            this.setState({ available: available });
            if (!isInit && !window.isMobile) {
              uiUpdate({ isInit: true });
            }
            if (isPlaying && available) {
              gsap.to(TheStylus, {
                rotation: 15,
                transformOrigin: this.SOrigin,
                onComplete: () => {
                  gsap.set(spinDom, { className: 'spin play' });
                  spin.play();
                  wiggle.play(0);
                  try {
                    const ift = SongPlayerIframe(data.id);
                    const iframe = Iframe(ift);
                    this.hiddenIframe = iframe;
                    ReactDOM.render(iframe, hiddenPlayer);
                  } catch (ex) {
                    console.log('err', ex);
                  }
                  clearTimeout(this.playNextTimeOut);
                  this.playNextTimeOut = setTimeout(() => playNext(), 30000);
                }
              });
            } else if (!available) {
              gsap.set(spinDom, { className: 'spin' });
              stop();
            }
          }
        },
        'vinylOut'
      );
  }
  play(data) {
    this.data = data;
    const { album } = data;
    const { images } = album;
    const { spinDom, TheStylus, playAnimate, albumBackAnumate, pause, spin, thealbum, state, albumback } = this;
    const { img } = state;
    pause();
    this.setState({ available: true });
    if (playAnimate && playAnimate.isActive()) {
      playAnimate.pause();
      playAnimate.kill();
    }
    if (albumBackAnumate && albumBackAnumate.isActive()) {
      albumBackAnumate.pause();
      albumBackAnumate.kill();
    }
    gsap.set(spinDom, { className: 'spin' });
    const duration1 = img === '' ? 0 : 0.25;
    this.playAnimate = gsap
      .timeline({})
      .add('stylusBack')
      .to(TheStylus, { rotation: 0 }, 'stylusBack')
      .add('vinylBack')
      .to('.vinyl', duration1, { x: 0 }, 'vinylBack')
      .add('vinylGone')
      .to('.vinyl', 0.1, { opacity: 0 }, 'vinylGone')
      .add('albumaway')
      .to(
        thealbum,
        duration1,
        {
          y: 500,
          opacity: 0,
          onComplete: () => {
            spin.seek(0);
            this.setState({
              img: images[1].url,
              albumText: data.name,
              albumArtistImg: album.artist.images[0].url,
              artistName: album.artist.name,
              artistUrl: album.artist.url,
              albumUrl: album.url
            });
            if (img === images[1].url) {
              albumback();
              this.setState({
                albumText: data.name
              });
            }
          }
        },
        'albumaway'
      );
  }
  doSearch() {
    const { fetchSearch } = this.props;
    fetchSearch(this.input.value);
  }
  render() {
    const { data, uiUpdate, colorInvert, color, colorBottom } = this.props;
    const { isPlaying } = data;
    const { available } = this.state;

    const StyledTextField = withStyles({
      root: {
        width: '100%',
        height: '100%',
        '& label.Mui-focused': {
          color: `${colorBottom}`
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: `${colorBottom}`
        },
        '& input': {
          height: '100%',
          color: `${colorBottom}`,
          borderRadius: 5,
          padding: 10
        },
        '& label': {
          color: `${colorBottom}`,
          fontSize: 12,
          fontFamily:
            'Noto Sans TC, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif'
        },
        '& .MuiInput-underline': {
          color: `${colorBottom}aa`
        }
      }
    })(TextField);
    return (
      <div ref={x => (this.ref = x)} className='player'>
        <div ref={x => (this.panel = x)} style={{ background: `${colorInvert}` }} className='panel'></div>
        <div className='vinyl'>
          <div ref={x => (this.spinDom = x)} className='spin'></div>
          <div ref={x => (this.vinylContent = x)} className='content'>
            <div ref={x => (this.middle = x)} className='middle'>
              <div className='text'>{this.state.albumText}</div>
              <div className='hole'></div>
              <div className='text bottom'>{this.state.artistName}</div>
            </div>
          </div>
        </div>
        <div ref={x => (this.thealbum = x)} className='thealbum'>
          <img
            ref={x => (this.img = x)}
            className='img'
            onLoad={x => {
              const { vinylContent, albumback } = this;
              const fac = new FastAverageColor();
              const color = fac.getColor(x.target);
              const c = invert(color.hex, true);
              gsap.to(vinylContent, { background: color.rgb, color: c, onComplete: () => albumback() });

              var parts = [];
              const count = 11;
              const naturalHeight = x.target.naturalHeight;
              const naturalHeightPart = Math.floor(naturalHeight / count);
              var colorBottom, backgroundBottom;
              for (var i = 0; i < count; i++) {
                const c2 = fac.getColor(x.target, { left: 0, top: i * naturalHeightPart, height: naturalHeightPart });
                parts.push(c2.rgb + ', ' + c2.rgb);
                if (i === count - 1) {
                  backgroundBottom = c2.hex;
                  colorBottom = invert(c2.hex, true);
                }
              }
              fac.destroy();
              var val = 'linear-gradient(to bottom, ' + parts.join(', ') + ')';
              uiUpdate({ background: val, color: c, colorInvert: color.hex, colorBottom: colorBottom, backgroundBottom: backgroundBottom });
            }}
            crossOrigin='Anonymous'
            src={this.state.img}
            alt=''
          />
        </div>
        <div ref={x => (this.hiddenPlayer = x)} className='hiddenPlayer'></div>
        {!available && <div className='notavailable'>Not Available</div>}
        <svg
          ref={x => (this.TheStylus = x)}
          onClick={() => {
            if (isPlaying) {
              this.stop();
            } else {
              this.resume();
            }
          }}
          className='Stylus'
          viewBox='0 0 79 422'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect x='51' y='6' width='10' height='335' fill='#D4D4D4' />
          <path d='M51.0001 2C51.0001 0.89543 51.8956 0 53.0001 0H59.0001C60.1047 0 61.0001 0.895431 61.0001 2V6H51.0001V2Z' fill='black' />
          <rect x='45.0001' y='10' width='6' height='39' fill='black' />
          <rect x='61.0001' y='10' width='6' height='39' fill='black' />
          <rect x='70.0001' y='61' width='9' height='20' rx='2' fill='black' />
          <path d='M41 68C41 66.8954 41.8954 66 43 66H70V76H43C41.8954 76 41 75.1046 41 74V68Z' fill='#D4D4D4' />
          <path d='M50.9999 341L60.9999 341L25.9999 401L17.4999 396L50.9999 341Z' fill='#D4D4D4' />
          <rect x='29.6664' y='366.12' width='18.9228' height='53.468' transform='rotate(32.8484 29.6664 366.12)' fill='black' />
          <circle ref={x => (this.c = x)} cx='56' cy='30' r='2' fill='white' />
        </svg>

        <div ref={x => (this.bottom = x)} className='bottom'>
          <a target='_blank' rel='noopener noreferrer' style={{ color: colorBottom }} href={this.state.artistUrl} className='artist'>
            <img style={{ borderRadius: '100%', width: 50, height: 50 }} src={this.state.albumArtistImg} alt={this.state.artistName} />
            <div>{this.state.artistName}</div>
          </a>
          <div className='controller'>
            <a
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: colorBottom }}
              href={this.state.albumUrl}
              ref={x => (this.albumTextDom = x)}
              className='albumTextDom'
            >
              {this.state.albumText}
            </a>
            <div
              className='button'
              onClick={() => {
                this.playPrevious();
              }}
            >
              <SkipPreviousIcon style={{ background: `${colorInvert}55`, color: colorBottom }} />
            </div>
            <div
              className='button center'
              onClick={() => {
                if (isPlaying) {
                  this.stop();
                } else {
                  this.resume();
                }
              }}
            >
              {!isPlaying ? (
                <PlayArrowIcon style={{ background: `${colorInvert}55`, color: colorBottom }} />
              ) : (
                <StopIcon style={{ background: `${colorInvert}55`, color: colorBottom }} />
              )}
            </div>
            <div
              className='button'
              onClick={() => {
                this.playNext();
              }}
            >
              <SkipNextIcon style={{ background: `${colorInvert}55`, color: colorBottom }} />
            </div>
          </div>
          <div className='searchPanel' style={{ color: colorBottom }}>
            <StyledTextField
              style={{ color: color }}
              onFocus={() => {
                this.isTyping = true;
              }}
              onBlur={() => {
                this.isTyping = false;
              }}
              onKeyPress={x => {
                if (x.key === 'Enter') {
                  this.doSearch();
                }
              }}
              inputRef={x => (this.input = x)}
              type='text'
              label='搜尋歌曲'
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state.Player,
  trackList: state.Album.data,
  next: state.Album.paging && state.Album.paging.next,
  previous: state.Album.paging && state.Album.paging.previous,
  kind: state.Album.kind,
  albumID: state.Album.albumID,
  color: state.UI.color,
  colorInvert: state.UI.colorInvert,
  colorBottom: state.UI.colorBottom,
  isInit: state.UI.isInit,
  total: state.Album.summary && state.Album.summary.total
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAlbum,
      playerUpdate,
      uiUpdate,
      fetchSearch
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Player);
