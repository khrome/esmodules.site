// A purely browser compatible native module with no deps

export class Banner extends HTMLElement {
    constructor(options={}) {
        super();
        this._options = options;
        this._data = [];
        this.attachShadow({ mode: 'open' });
        this._container = document.createElement('a');
        this._container.visibility = 'hidden';
        const style = document.createElement('style'); 
        const w = options.inset || 15.38;
        const diff = w - 15.38;
        const width = 12.1 + diff/2
        const height = 12.1 + diff/2
        //const width = options.width || options.inset || 12.1; //12.1
        //const height = options.height || options.inset || 12.1; //12.1
        //const margin  = w - width - 0.04; //3.23
        const margin  = 3.23+diff/4; //3.23
        //const w = width + margin + 0.04;  //15.38
        const lineSize  = 1.54; //1.54
        style.innerHTML = `.ribbon {
          width: ${width}em;
          height: ${height}em;
          position: absolute;
          overflow: hidden;
          top: 0;
          right: 0;
          z-index: 9999;
          pointer-events: none;
          font-size: 13px;
          text-decoration: none;
          text-indent: -999999px;
        }
        
        .ribbon.fixed {
          position: fixed;
        }
        
        .ribbon:hover, .ribbon:active {
          background-color: rgba(0, 0, 0, 0.0);
        }
        
        .ribbon:before, .ribbon:after {
          /* The right and left classes determine the side we attach our banner to */
          position: absolute;
          display: block;
          width: ${ w }em;
          height: ${lineSize}em;
        
          top: ${margin}em;
          right: ${-1 * margin}em;
        
          -webkit-box-sizing: content-box;
          -moz-box-sizing: content-box;
          box-sizing: content-box;
        
          -webkit-transform: rotate(45deg);
          -moz-transform: rotate(45deg);
          -ms-transform: rotate(45deg);
          -o-transform: rotate(45deg);
          transform: rotate(45deg);
        }
        
        .ribbon:before {
          content: "";
        
          /* Add a bit of padding to give some substance outside the "stitching" */
          padding: .38em 0;
        
          /* Set the base colour */
          background-color: ${options.color || '#a00'};
        
          /* Set a gradient: transparent black at the top to almost-transparent black at the bottom */
          background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 0.15)));
          background-image: -webkit-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
          background-image: -moz-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
          background-image: -ms-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
          background-image: -o-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
          background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
        
          /* Add a drop shadow */
          -webkit-box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);
          -moz-box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);
          box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);
        
          pointer-events: auto;
        }
        
        .ribbon:after {
          /* Set the text from the data-ribbon attribute */
          content: attr(ribbon-text);
        
          /* Set the text properties */
          color: #fff;
          font: 700 1em "Helvetica Neue", Helvetica, Arial, sans-serif;
          line-height: ${lineSize}em;
          text-decoration: none;
          text-shadow: 0 -.08em rgba(0, 0, 0, 0.5);
          text-align: center;
          text-indent: 0;
        
          /* Set the layout properties */
          padding: .15em 0;
          margin: .15em 0;
        
          /* Add "stitching" effect */
          border-width: .08em 0;
          border-style: dotted;
          border-color: #fff;
          border-color: rgba(255, 255, 255, 0.7);
        }
        
        .ribbon.left-top, .ribbon.left-bottom {
          right: auto;
          left: 0;
        }
        
        .ribbon.left-bottom, .ribbon.right-bottom {
          top: auto;
          bottom: 0;
        }
        
        .ribbon.left-top:before, .ribbon.left-top:after, .ribbon.left-bottom:before, .ribbon.left-bottom:after {
          right: auto;
          left: ${-1 * margin};
        }
        
        .ribbon.left-bottom:before, .ribbon.left-bottom:after, .ribbon.right-bottom:before, .ribbon.right-bottom:after {
          top: auto;
          bottom: ${margin};
        }
        .ribbon.left-top:before, .ribbon.left-top:after, .ribbon.right-bottom:before, .ribbon.right-bottom:after {
          -webkit-transform: rotate(-45deg);
          -moz-transform: rotate(-45deg);
          -ms-transform: rotate(-45deg);
          -o-transform: rotate(-45deg);
          transform: rotate(-45deg);
        }
        `;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this._container);
    }
    
    connectedCallback(){
        this.render();
        this.display();
    }
    
    render(){
        const ribbon = document.createElement('div');
        ribbon.classList.add('ribbon');
        ribbon.classList.add(this.getAttribute('position') || 'right-top');
        ribbon.setAttribute('ribbon-text', this._options.text);
        this._container.appendChild(ribbon);
    }
    
    display(){
        this._container.visibility = 'visible';
    }

}

customElements.define('custom-banner', Banner);

export class ModuleBanner extends Banner {
    constructor(options={}) {
        options.color = '#BBBB00'
        options.text = 'Native ES Modules';
        options.inset = 23;
        super(options);
        this._container.setAttribute('href', 'http://esmodules.site');
    }
}
customElements.define('module-banner', ModuleBanner);

export class ForkBanner extends Banner {
    constructor(options={}) {
        super(options);
        const urlValue = this.getAttribute('url');
        if(!urlValue) throw new Error('url not provided on ForkBanner');
        const url = new URL(urlValue);
        this._container.setAttribute('href', url);
        const parts = url.hostname.split('.');
        parts.pop();
        let name = parts.pop();
        name = name[0].toUpperCase()+name.substring(1);
        options.text = `Fork me on ${name}`;
    }
}
customElements.define('fork-banner', ForkBanner);