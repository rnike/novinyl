import React, { Component } from 'react';
import { connect } from 'react-redux';
import './MenuItems.scss';
import { bindActionCreators } from 'redux';
import { menuUpdateGroup, playerUpdate } from '../redux/actions';
import { fetchSelector, NEW_HITS, fetchAlbum } from '../redux/api';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import gsap from 'gsap';
// [data format]
// id: "1_pCwOnj-qZsGU3rTJ"
// title: "日語速爆新歌(每週日更新)"
// description: "【封面人物：sumika】日本新世代人氣樂團，新單曲〈願い〉為人氣日劇〈大叔的愛－in the sky－〉主題曲"
// url: "https://www.kkbox.com/tw/tc/playlist/1_pCwOnj-qZsGU3rTJ"
// images: (3) [{…}, {…}, {…}]
// updated_at: "2019-12-27T04:19:48+00:00"
// owner:{
// id: "Ooerjv5-p-TJsFGLg5"
// url: "https://www.kkbox.com/tw/profile/Ooerjv5-p-TJsFGLg5"
// name: "KKBOX 日語小編"
// description: ""
// images: (3) [{
//         height: 180
// width: 180
// url: "https://i.kfs.io/muser/global/94563302v1/cropresize/180x180.jpg"
//     }, {…}, {…}]
// }
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
