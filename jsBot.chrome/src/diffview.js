diffview = {
	buildView: function (params) {
		var baseTextLines = params.baseTextLines;
		var newTextLines = params.newTextLines;
		var opcodes = params.opcodes;

		if (baseTextLines == null)
			throw "Cannot build diff view; baseTextLines is not defined.";
		if (newTextLines == null)
			throw "Cannot build diff view; newTextLines is not defined.";
		if (!opcodes)
			throw "Canno build diff view; opcodes is not defined.";

    var txt = [];

    function normalLine (tidx, tidx2, textLines, change) {
      return {
          "change":change,
          "lines":textLines[tidx]
      };
    }
    function changeLine (tidx, tidx2, textLines, change) {
      return {
          "change":change,
          "lines":textLines[tidx != null ? tidx : tidx2]
      };
		}

		for (var idx = 0; idx < opcodes.length; idx++) {
			code = opcodes[idx];
			change = code[0];
			var b = code[1];
			var be = code[2];
			var n = code[3];
			var ne = code[4];
			var rowcnt = Math.max(be - b, ne - n);

      if (change == "insert") {
        txt.push(changeLine(null, n++, newTextLines, change));
      } else if(change == 'replace') {
        if (b < be) {
          txt.push(changeLine(b++, null, baseTextLines, "delete"));
        }
        if (n < ne) {
          txt.push(changeLine(null, n++, newTextLines, "insert"));
        }
      } else if (change == "delete") {
        txt.push(changeLine(b++, null, baseTextLines, change));
      }
		}
		return txt;
	}
};
