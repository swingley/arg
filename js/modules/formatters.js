define([
  "dojo/_base/array",
  "dojo/_base/lang"
], function(
  arrayUtils, lang
) {
  return {
    // format an arrays of module IDs
    // first param is expected to be esri module aliases
    // second param is expected to be dojo module aliases
    // third param is expected to be the amount to indent each line
    mids: function(e, d, pad) {
      this.pad = pad;
      var combined = "", formattedEsriMids, formattedDojoMids;
      
      if ( !e.length && !d.length ) {
        return combined;
      }
      
      if ( e.length ) {
        // format module and alias arrays and convert to strings:  indent and add breaks
        formattedEsriMids = arrayUtils.map(e, this.formatModule, this);
        formattedEsriMids = this.formatArray(formattedEsriMids);
      }

      if ( d.length ) {
        // always put domReady at the end
        for ( var i = 0, il = d.length; i < il; i++ ) {
          if ( d[i].id === "dojo/domReady!" ) {
            d.push(d.splice(i, 1)[0]);
            break;
          }
        }
        formattedDojoMids = arrayUtils.map(d, this.formatModule, this);
        formattedDojoMids = this.formatArray(formattedDojoMids);
      }

      if ( formattedEsriMids && formattedDojoMids ) {
        combined = formattedEsriMids + ",\n" + formattedDojoMids;
      } else {
        combined = formattedEsriMids || formattedDojoMids;
      }

      return combined;
    },

    aliases: function(e, d, pad) {
      this.pad = pad;
      var combined = "", formattedEsriAliases, formattedDojoAliases;
      // used to strip domReady alias from callback args
      var domReady = ",\n" + this.pad + "domReady";

      if ( !e.length && !d.length ) {
        return combined;
      }

      if ( e.length ) {
        formattedEsriAliases = arrayUtils.map(e, this.formatAlias, this);
        formattedEsriAliases = this.formatArray(formattedEsriAliases);
      }
      
      if ( d.length ) {
        formattedDojoAliases = arrayUtils.map(d, this.formatAlias, this);
        formattedDojoAliases = this.formatArray(formattedDojoAliases);
        formattedDojoAliases = formattedDojoAliases.replace(domReady, "");
      }

      if ( formattedEsriAliases && formattedDojoAliases ) {
        combined = formattedEsriAliases + "\n" + formattedDojoAliases;
      } else {
        combined = formattedEsriAliases || formattedDojoAliases;
      }

      return combined;
    },

    formatModule: function(m) {
      return this.pad + "\"" + m.id + "\",\n";
    },

    formatAlias: function(a) {
      return this.pad + a.alias.replace(/\*/g, "") + ",\n";
    },

    formatArray: function(a) {
      // remove comma and newline from last element in the array
      // return a string
      if ( !a.length ) {
        return "";
      }
      a[a.length - 1] = a[a.length - 1].replace(",\n", "");
      return a.join("");
    }
  };
});