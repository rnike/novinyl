import React, { Component } from 'react';
import { connect } from 'react-redux';
import './MenuItems.scss';
import { bindActionCreators } from 'redux';
import { menuUpdateGroup, playerUpdate } from '../redux/actions';
import { fetchSelector, NEW_HITS, fetchAlbum } from '../redux/api';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import gsap from 'gsap';
export class MenuItems extends Component {
  componentDidMount() {
    const { isOpen } = this.props.groupData;
    const { icon, list } = this;
    gsap.to(icon, { rotation: isOpen ? 180 : 0 });
    gsap.to(list, { height: isOpen ? 'auto' : '0' });
  }

  componentDidUpdate(prevProps) {
    const { isOpen } = this.props.groupData;
    const { icon, list } = this;
    if (prevProps.groupData.isOpen !== isOpen) {
      gsap.to(icon, { rotation: isOpen ? 180 : 0 });
      gsap.to(list, { height: isOpen ? 'auto' : '0' });
    }
  }
  render() {
    const { groupData, menuUpdateGroup, fetchAlbum, playerUpdate, groupTitle } = this.props;
    const { data, isOpen, kind } = groupData;
    return (
      <div className='MenuItems'>
        <div onClick={() => menuUpdateGroup({ ...groupData, isOpen: !isOpen })} className='header'>
          <div>{groupTitle}</div>
          <ExpandMoreIcon ref={x => (this.icon = x)} className='icon' />
        </div>
        <div ref={x => (this.list = x)} className='list'>
          {data &&
            data.map((x, i) => {
              const { id, title } = x;
              return (
                <div
                  onClick={() => {
                    fetchAlbum(id, NEW_HITS);
                    playerUpdate({ index: 0 });
                  }}
                  key={`${kind}${i}`}
                  className='item'
                >
                  <div className='title'>{title}</div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      menuUpdateGroup,
      fetchSelector,
      fetchAlbum,
      playerUpdate
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MenuItems);
