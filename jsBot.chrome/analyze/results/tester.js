{
 "targetAddr": "http://localhost/",
 "baseHTML": "\n    <h1>Test Page</h1>\n    <ul>\n      <li>\n        <a id=\"event1\">Event1</a>\n      </li>\n      <li>\n        <a id=\"event2\">Event2</a>\n      </li>\n      <li>\n        <a id=\"event0\">Event0</a>\n      </li>\n      <li>\n        <a id=\"link1\" href=\"http://piserver.at\">Real Link</a>\n      </li>\n    </ul>\n    <div id=\"text-target1\">null - 1</div>\n    <br>\n    <div id=\"text-target2\">\n      null - 2\n      <div id=\"text-target3\">\n        <a id=\"event3\">Event3</a>\n      </div>\n    </div>\n    <br>\n\n    <script type=\"text/javascript\">\n      //console.log($('#event1'));\n\n      $('#event0').click(function(){\n        window.open(\"http://derstandard.at/Web?_chron=t\",target=\"_blank\");\n        //window.location = 'http://piserver.at';\n      });\n\n      $('#event1').click(function(){\n        $('#text-target1').html(\"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\");\n        //alert('stop');\n      });\n      $('#event3').click(function(){\n        $('#text-target3').html(\"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\");\n        //window.location = 'http://piserver.at';\n      });\n\n      var ev2 = document.getElementById(\"event2\");\n      ev2.addEventListener(\"click\", function(){\n        document.getElementById(\"text-target2\").innerHTML = \"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\";\n      }, false);\n    </script>\n  \n\n",
 "harvestHTML": [
  {
   "test": "click",
   "diff": [
    {
     "change": "delete",
     "lines": "    <div id=\"text-target1\" class=\"jsb0086c65e750bcee91af0dd725f7a9ec7\">null - 1</div>"
    },
    {
     "change": "insert",
     "lines": "    <div id=\"text-target1\" class=\"jsb0086c65e750bcee91af0dd725f7a9ec7\">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>"
    }
   ]
  },
  {
   "test": "click",
   "diff": [
    {
     "change": "delete",
     "lines": "    <div id=\"text-target2\" class=\"jsbdfda93813b264534702fd175da208264\">"
    },
    {
     "change": "insert",
     "lines": "    <div id=\"text-target2\" class=\"jsbdfda93813b264534702fd175da208264\">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>"
    }
   ]
  }
 ],
 "harvestLinksHTML": [
  "http://piserver.at"
 ],
 "harvestLinksJS": [
  "http://derstandard.at/Web?_chron=t"
 ]
}
