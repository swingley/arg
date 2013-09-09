define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/on",
], function(
  declare, lang, dom, on
) {
  return declare(null, {
    // params is an object expected to have a el property
    // el is a string representing a dom node id
    constructor: function(params) {
      lang.mixin(this, params);

      this.el = dom.byId(this.id);
      if ( !this.el || (this.el.firstChild.nodeType !== 3) ) {
        console.log("TextSelector::unable to find a suitable dom node");
        return;
      }

      // give proper context for event listeners with lang.hitch
      on(this.el, "click", lang.hitch(this, this.select));
      on(this.el, "blur", lang.hitch(this, this.deselect));
    },

    select: function() {
      if ( !this.isEditable(this.el) ) {
        this.el.setAttribute("contentEditable", true);
      }
      // current selection
      var sel = window.getSelection();
      // create a range:  
      // https://developer.mozilla.org/en-US/docs/Web/API/document.createRange
      var range = document.createRange();
      // use firstChild as range expects a textNode, not an elementNode
      range.setStart(this.el.firstChild, 0);
      // when a full html page is being used, < and > are represented by
      // &lt; and &gt; which misrepresents the length of innerHTML
      // replace all instances of those to find actual string length
      var end = this.el.innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").length;
      range.setEnd(this.el.firstChild, end);
      sel.removeAllRanges();
      sel.addRange(range);
    },

    deselect: function() {
      if ( this.isEditable(this.el) ) {
        this.el.removeAttribute("contentEditable");
      }
    },

    isEditable: function() {
      return this.el.getAttribute("contentEditable");
    }
  });
});