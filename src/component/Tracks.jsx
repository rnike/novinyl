import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchAlbum } from '../redux/api';
import './Tracks.scss';
import { bindActionCreators } from 'redux';
import TrackItem from './TrackItem';
import { playerUpdate } from '../redux/actions';
import gsap from 'gsap';
import ArrowRightIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowLeftIcon from '@material-ui/icons/ArrowBackIos';
export class Tracks extends Component {
  constructor(props) {
    super(props);
    this.updateTrackItemSize = this.updateTrackItemSize.bind(this);
    this.onResize = this.onResize.bind(this);
  }
  onResize() {
    clearTimeout(this.resizeTimeOut);
    this.resizeTimeOut = setTimeout(() => this.updateTrackItemSize(), 500);
  }
  updateTrackItemSize() {
    const { list } = this;
    const lofw = list.offsetWidth / 15;
    gsap.to('.TrackItem', { marginRight: -50, width: lofw + 45 });
  }
  componentDidMount() {
    const { onResize } = this;
    window.addEventListener('resize', onResize);
  }
  componentWillUnmount() {
    const { onResize } = this;
    window.removeEventListener('resize', onResize);
  }

  componentDidUpdate(prePro, preState) {
    const { next, previous, kind, offset  } = this.props;
    if (prePro.offset !== offset || prePro.next !== next || prePro.previous !== previous || prePro.kind !== kind) {
      gsap.fromTo('.TrackItem', { x: this.toright ? -1000 : 1000 }, { x: 0, stagger: this.toright ? -0.02 : 0.02 });
    }
  }
  previousClick() {
    const { previous, fetchAlbum, kind ,albumID} = this.props;
    if (!previous) return;
    const w = this.ref.offsetWidth;
    gsap.fromTo(
      '.TrackItem',
      0.2,
      { x: 0 },
      {
        x: w,
        stagger: -0.002,
        onComplete: () => {
          this.toright = true;
          fetchAlbum(albumID, kind, previous);
        }
      }
    );
  }
  nextClick() {
    const { next, fetchAlbum, kind ,albumID} = this.props;
    if (!next) return;
    const w = this.ref.offsetWidth;
    gsap.fromTo(
      '.TrackItem',
      0.2,
      { x: 0 },
      {
        x: -w,
        stagger: -0.002,
        onComplete: () => {
          this.toright = false;
          fetchAlbum(albumID, kind, next);
        }
      }
    );
  }
  render() {
    const { data, previous, next, playerUpdate} = this.props;
    return (
      <div ref={x => (this.ref = x)} className='tracks'>
        <div ref={x => (this.list = x)} className='list'>
          {data &&
            data.map((x, i) => {
              const { album } = x;
              const { id } = album;
              return (
                <TrackItem listWidth={this.list.offsetWidth} key={`${id}${i}`} data={x} onClick={() => playerUpdate({ ...x, index: i, isPlaying: true })} />
              );
            })}
        </div>
        <div className='buttons' >
          <div className='button left' onClick={() => this.previousClick()}>
            {previous && <ArrowLeftIcon />}
          </div>
          <div className='button' onClick={() => this.nextClick()}>
            {next && <ArrowRightIcon />}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state.Album.data,
  next: state.Album.paging && state.Album.paging.next,
  previous: state.Album.paging && state.Album.paging.previous,
  total: state.Album.summary && state.Album.summary.total,
  offset: state.Album.paging && state.Album.paging.offset,
  limit: state.Album.paging && state.Album.paging.limit,
  kind: state.Album.kind,
  colorInvert: state.UI.colorInvert,
  albumID:state.Album.albumID
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAlbum,
      playerUpdate
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Tracks);
