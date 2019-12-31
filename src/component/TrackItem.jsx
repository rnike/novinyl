import React, { Component } from 'react';
import { connect } from 'react-redux';
import './TrackItem.scss';
import gsap from 'gsap';
export class TrackItem extends Component {
  constructor(props) {
    super(props);
    this.setSize = this.setSize.bind(this);
  }
  componentDidMount() { 
    this.setSize(); 
  }
  setSize() { 
    const {listWidth}= this.props;  
    const { ref  } = this;
    const lofw = listWidth/15;  
    this.width =  lofw+45
    this.marginRight =  -50
    gsap.to(ref, { marginRight:  this.marginRight, width: this.width  });
  } 
  mouseEnter() {
    const { ref, itemNameText } = this;
    gsap.to(ref, { marginRight: 0  ,y:30});
    gsap.to(itemNameText, { opacity: 1, height: 20 });
  }
  mouseLeave() {
    const { ref, itemNameText,  marginRight } = this;
    gsap.to(ref, { marginRight: marginRight  ,y:0});
    gsap.to(itemNameText, { opacity: 0, height: 0 });
  }
  render() {
    const { colorInvert } = this.props;
    const { data, onClick } = this.props;
    const { album, name } = data;
    const { images } = album;
    return (
      <div ref={x => (this.ref = x)} onMouseEnter={() => this.mouseEnter()} onMouseLeave={() => this.mouseLeave()} className='TrackItem' onClick={onClick}>
        <div className='img'>
          <img src={images[0].url} alt='' />
        </div>
        <div style={{ background: `${colorInvert}55` }} ref={x => (this.itemNameText = x)} className='itemNameText'>
          {name}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  background: state.UI.background,
  colorInvert: state.UI.colorInvert
});
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(TrackItem);
