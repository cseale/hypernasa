'use strict'

const { nasaApiKey } = require('./nasa-api-key');

exports.decorateConfig = (config) => {
  const { overlayColor = '#000', overlayOpacity = .5 } = config.hypernasa || {};

  return Object.assign({}, config, {
    backgroundColor: 'transparent',
    css: `
      ${config.css}

      .hyper_main {
        background-color: ${overlayColor};
        background-size: cover;
        background-position: center;
      }

      .hyper_main:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: ${overlayColor};
        opacity: ${overlayOpacity};
      }
    `
  });
}

exports.decorateHyper = (Hyper, { React }) =>
  class extends React.Component {
    constructor (props, context) {
      super(props, context);
      this._fetchImage();
    }

    _fetchImage () {
      fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`)
        .then((response) => response.json())
        .then(({ hdurl, url }) => this.setState({ image: hdurl || url }));
    }

    render () {
      return React.createElement(Hyper, Object.assign({}, this.props, {
        customCSS: `
          ${this.props.customCSS}

          .hyper_main {
            background-image: url("${this.state && this.state.image}");
          }
        `
      }));
    }
  };
