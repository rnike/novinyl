import React, { Component } from 'react';
import { connect } from 'react-redux';
import MenuIcon from '@material-ui/icons/Menu';
import { menuUpdate } from '../redux/actions';
import { bindActionCreators } from 'redux';
import { fetchMenuItems, fetchSearch } from '../redux/api';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import MenuItems from './MenuItems';
import gsap from 'gsap';
import './Menu.scss';
export class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = { searchType: 'track' };
    this.search = this.search.bind(this);
  }
  componentDidMount() {
    this.props.fetch();
  }
  componentDidUpdate(prevProps) {
    const { isOpen, isSearching } = this.props;
    const { origin, searchList } = this;
    if (prevProps.isOpen !== isOpen) {
      gsap.to('.drawer', {
        width: isOpen ? 300 : 0,
        paddingLeft: isOpen ? 20 : 0,
        paddingTop: isOpen ? 10 : 0
      });
      gsap.to('.menu', {
        width: isOpen ? 320 : 30
      });
    }
    if (prevProps.isSearching !== isSearching) {
      gsap.to(origin, {
        x: isSearching ? -1000 : 0,
        height: isSearching ? '0%' : '100%'
      });
      gsap.to(searchList, {
        x: !isSearching ? -1000 : 0,
        height: !isSearching ? '0%' : '100%'
      });
    }
  }
  search(text) {
    const { menuUpdate } = this.props;
    menuUpdate({
      isSearching: text === '' ? false : true
    });
  }
  render() {
    const { menuUpdate, isOpen, NEW_HITS, FETURED, fetchSearch, background, colorInvert } = this.props;
    return (
      <div style={{ background: `${background}` }} className='menu'>
        <div style={{ background: `${colorInvert}99` }} className='drawer'>
          <div
            style={{
              width: 300,
              userSelect: 'none',
              fontWeight: 700,
              fontSize: 18,
              padding: 3
            }}
          >
            NOVINYL v0.0.1
          </div>
          <div className='drawerContent'>
            <div ref={x => (this.origin = x)} className='origin'>
              {NEW_HITS && <MenuItems groupTitle={'速爆新歌'} groupData={NEW_HITS} />}
              {FETURED && <MenuItems groupTitle={'FETURED'} groupData={FETURED} />}
              <div
                className='SigleItem'
                onClick={() => {
                  fetchSearch('Davie504');
                }}
              >
                Davie504
              </div>
            </div>
            <div ref={x => (this.searchList = x)} className='searchList'></div>
          </div>
        </div>
        <div
          className='clickable'
          onClick={() => {
            menuUpdate({ isOpen: !isOpen });
          }}
        >
          {!isOpen && <MenuIcon />}
          {isOpen && <ArrowBackIosIcon />}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isOpen: state.Menu.isOpen,
  NEW_HITS: state.Menu.NEW_HITS,
  FETURED: state.Menu.FETURED,
  isSearching: state.Menu.isSearching,
  background: state.UI.background,
  colorInvert: state.UI.colorInvert
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      menuUpdate,
      fetch: fetchMenuItems,
      fetchSearch
    },
    dispatch
  );
export default connect(mapStateToProps, mapDispatchToProps)(Menu);
