import Tracks from './component/Tracks';
import Menu from './component/Menu';
import Player from './component/Player';
import React, { Component } from 'react';
import { menuUpdate } from './redux/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './App.scss';
import noise from './res/noise.png';
import gsap from 'gsap';
import CSSRulePlugin from 'gsap/CSSRulePlugin';
export class App extends Component {
  componentDidUpdate(prevProps, prevState) {
    const { background, color, isInit } = this.props;
    if (prevProps.background !== background || prevProps.color !== color) {
      const { ref } = this;
      const thumb = CSSRulePlugin.getRule('::-webkit-scrollbar-thumb');
      gsap
        .timeline()
        .add('colorChanged')
        .to(ref, { background: background, color: color }, 'colorChanged')
        .to(thumb, { background: background }, 'colorChanged')
        .to('body', { 'scrollbar-face-color': background }, 'colorChanged');
    }
    if (prevProps.isInit !== isInit) {
      gsap.to('.loadingPg', {
        opacity: 0,
        onComplete: () => {
          gsap.set('.loadingPg', { pointerEvents: 'none' });
        }
      });
    }
  }

  render() {
    const { menuUpdate, colorInvert, color,colorBottom } = this.props;
    const { isMobile, isSafari, isChrome } = window;
    return (
      <div style={{ background: `${colorInvert}99` }} className='bgOut'>
        <div ref={x => (this.ref = x)} className='App'>
          <div className='bg' style={{ backgroundImage: `url(${noise})` }}></div>
          <div
            className='left'
            onMouseEnter={() => {
              menuUpdate({ isOpen: true });
            }}
          >
            <Menu />
          </div>
          <div
            className='right'
            onMouseEnter={() => {
              menuUpdate({ isOpen: false });
            }}
          >
            <div className='rightTop'>
              <Tracks />
            </div>
            <div className='rightBottom'>
              <Player />
            </div>
          </div>
          <div className='loadingPg'>
            <div className='content'>
              <div className='logo'>NOVINYL</div>
              <div className='loading'>loading</div>
            </div>
          </div>
          <a style={{color:colorBottom}} className='info' target='_blank' rel='noopener noreferrer' href='https://www.kkbox.com/tw/tc/info/index.html'>Powered by KKBOX</a>
    
          {isMobile && (
            <div style={{ color: colorBottom }} className='Warning'>
              不支援行動裝置 ifram autoplay issue
            </div>
          )}
          { (
            <div style={{ color: colorBottom }} className='Warning'>
              <div>Safari 瀏覽器請先至設定允許此頁面的自動撥放</div>
              <a style={{ color: colorBottom }} target='_blank' rel='noopener noreferrer'  href="https://www.howtogeek.com/326532/safari-now-disables-auto-playing-videos.-heres-how-to-allow-them-for-certain-sites/">如何做?</a>
            </div>
          )}
          {!isMobile && !isChrome && !isSafari && (
            <div style={{ color: colorBottom }} className='Warning'>
              使用 Chrome 獲得最佳體驗
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  SelectorIsOpen: state.Selector.isOpen,
  background: state.UI.background,
  color: state.UI.color,
  colorInvert: state.UI.colorInvert,
  colorBottom:state.UI.colorBottom,
  isInit: state.UI.isInit
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      menuUpdate
    },
    dispatch
  );
export default connect(mapStateToProps, mapDispatchToProps)(App);
