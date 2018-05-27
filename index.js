'use strict'

const { nasaApiKey } = require('./nasa-api-key');

exports.decorateConfig = (config) => {
  const { overlayColor = '#000', overlayOpacity = .2 } = config.hypernasa || {};

  return Object.assign({}, config, {
    backgroundColor: 'transparent',
    css: `
      ${config.css}

      .hyper_main {
        background-color: ${overlayColor} !important;
        opacity: 0.9;
      }

      #hyper-nasa-blur {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-size: cover;
        background-position: center;
        filter: blur(3px);
        opacity: ${overlayOpacity};
        pointer-events: none;
      }

      #hyper-nasa-blur iframe {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
      }

      .tab_tab {
        background-color: transparent !important;
      }
    `
  });
}

exports.decorateHyper = (Hyper, { React }) =>
  class extends React.Component {
    constructor (props, context) {
      super(props, context);
      this._fetchImage();
      this._startUpdater();
    }

    _fetchImage () {
      fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`)
        .then((response) => response.json())
        .then(({ hdurl, url }) => {
          let type = "image";
          if (url.indexOf('youtube') !== -1)
            type = "youtube";
          this.setState({ image: hdurl || url, type: type })
        });
    }

    _startUpdater () {
      const second = 1000
      const minute = 60 * second
      const hour = 60 * minute
      setInterval(this._fetchImage.bind(this), hour)
    }

    youtube_parser(url) {
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var match = url.match(regExp);
      return (match&&match[7].length==11)? match[7] : false;
    }

    render () {
      var style = {}, content = null;
      if (this.state) {
        if (this.state.type === "image")
          style = {backgroundImage: `url("${this.state && this.state.image}")`};
        else if (this.state.type === "youtube") {
          var vidid = this.youtube_parser(this.state.image);
          content = React.createElement("iframe",
            {
              src: this.state.image + `&autoplay=1&controls=0&disablekb=1&loop=1&modestbranding=1&playlist=${vidid}`,
              allow: "autoplay; encrypted-media"
            }
          );
        }
      }
      var customChildren = Array.from(this.props.customChildren || [])
        .concat(React.createElement("div",  {
          id: "hyper-nasa-blur",
          style: style
        }, content
      ));
      return React.createElement(Hyper, Object.assign({}, this.props, {customChildren: customChildren}));
    }
  };
