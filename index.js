const { nasaApiKey } = require('./nasa-api-key');

exports.decorateConfig = (config) => {
  return Object.assign({}, config, {
    backgroundColor: 'transparent'
  });;
}

exports.decorateHyper = (Hyper, { React }) => {

  return class extends React.Component {
    constructor (props, context) {
      super(props, context);
      this._fetchImage = this._fetchImage.bind(this);
      this._fetchImage();
    }

    _fetchImage () {
      const potdImageUrl= `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`;

      fetch(potdImageUrl).then((response) => {
        response.json().then((data) => {
          this.setState({image: data.hdurl || data.url});
        });
      });
    }

    render () {
      let css = `${config.css || ''}
        .hyper_main {
          background-color: #000;
        }`;

      if (this.state && this.state.image) {
        css = `${config.css || ''}
          .hyper_main {
            background-image: url(${this.state.image});
            background-size: cover;
            background-color: #000;
          }`;
      }

      return React.createElement(Hyper, Object.assign({}, this.props, {
        customCSS: css
      }));
    }
  }
};
