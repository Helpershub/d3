require("../env");

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("selection.sort");

suite.addBatch({
  "selectAll(div).selectAll(span)": {
    topic: function() {
      return d3.select("body").html("").selectAll("div")
          .data([1, 2, 10, 20])
        .enter().append("div").selectAll("span")
          .data(function(d) { return [20 + d, 2 + d, 10, 1]; })
        .enter().append("span");
    },
    "sorts elements by natural order": function(span) {
      span.sort();
      assert.domNull(span[0][0].previousSibling);
      assert.domEqual(span[0][1].previousSibling, span[0][0]);
      assert.domEqual(span[0][2].previousSibling, span[0][1]);
      assert.domEqual(span[0][3].previousSibling, span[0][2]);
      assert.domNull(span[0][3].nextSibling);
    },
    "sorts each group independently": function(span) {
      span.sort(d3.descending);
      assert.deepEqual(span[0].map(data), [21, 10, 3, 1]);
      assert.deepEqual(span[1].map(data), [22, 10, 4, 1]);
      assert.deepEqual(span[2].map(data), [30, 12, 10, 1]);
      assert.deepEqual(span[3].map(data), [40, 22, 10, 1]);
    },
    "sorts using the specified comparator": function(span) {
      span.sort(function(a, b) { return d3.ascending(a+"", b+""); });
      assert.deepEqual(span[0].map(data), [1, 10, 21, 3]);
      assert.deepEqual(span[1].map(data), [1, 10, 22, 4]);
      assert.deepEqual(span[2].map(data), [1, 10, 12, 30]);
      assert.deepEqual(span[3].map(data), [1, 10, 22, 40]);
    },
    "sorts null nodes at the end of the selection": function() {
      var span = d3.selectAll("div").selectAll("span"), nulls = 0;
      d3.select(span[0][0]).remove();
      span[0][0] = null;
      span.sort(function(a, b) { if ((a === null) || (b === null)) ++nulls; return a - b; });
      assert.equal(nulls, 0);

      assert.isNull(span[0][3]);
      assert.domNull(span[0][0].previousSibling);
      assert.domEqual(span[0][1], span[0][0].nextSibling);
      assert.domEqual(span[0][0], span[0][1].previousSibling);
      assert.domEqual(span[0][2], span[0][1].nextSibling);
      assert.domEqual(span[0][1], span[0][2].previousSibling);
      assert.domNull(span[0][2].nextSibling);
      assert.deepEqual(span[0].slice(0, -1).map(data), [3, 10, 21]);

      for (var i = 1; i < 4; ++i) {
        var d = span[i].parentNode.__data__;
        assert.domNull(span[i][0].previousSibling);
        assert.domEqual(span[i][1], span[i][0].nextSibling);
        assert.domEqual(span[i][0], span[i][1].previousSibling);
        assert.domEqual(span[i][2], span[i][1].nextSibling);
        assert.domEqual(span[i][1], span[i][2].previousSibling);
        assert.domEqual(span[i][3], span[i][2].nextSibling);
        assert.domEqual(span[i][2], span[i][3].previousSibling);
        assert.domNull(span[i][3].nextSibling);
        assert.deepEqual(span[i].map(data), [1, 2 + d, 10, 20 + d].sort(d3.ascending));
      }
    },
    "returns the current selection": function(span) {
      span = d3.select("body"); // https://github.com/tmpvar/jsdom/issues/277
      assert.isTrue(span.sort() === span);
    }
  }
});

function data(d) {
  return d.__data__;
}

suite.export(module);
