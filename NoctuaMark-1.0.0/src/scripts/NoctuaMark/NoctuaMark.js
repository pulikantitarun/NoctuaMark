// ============================================================
//  NoctuaMark.js
//  PixInsight Astrophotography Watermark & Annotation Tool
//
//  Author   : Tarun Pulikanti  @hyderabadiastro
//  Version  : 1.0  (June 2026)
//
//  Credits
//  ───────
//  Concept, design and development by Tarun Pulikanti.
//  Built for the astrophotography community — feel free to
//  share and credit @hyderabadiastro.
//
//  Features
//  ────────
//  • Signature  — name, handle, year, font, proportional size
//  • FITS/XISF  — editable metadata paragraph, multi-line
//  • Description — free-form caption block, multi-line
//  • PNG Logo   — drag-and-drop, proportional scale
//  • Annotations — unlimited arrow + label overlays
//  • Live preview on the actual image; all elements draggable
//  • Settings persist between sessions
// ============================================================

#feature-id    NoctuaMark : Utilities > NoctuaMark
#feature-info  Astrophotography watermark: signature, FITS metadata, captions, annotations. By Tarun Pulikanti @hyderabadiastro
#feature-icon  NoctuaMark.xpm

#include <pjsr/Sizer.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/TextAlign.jsh>
#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/Color.jsh>
#include <pjsr/FontFamily.jsh>
#include <pjsr/DataType.jsh>

// ════════════════════════════════════════════════════════════
//  FONTS
// ════════════════════════════════════════════════════════════
var FONTS = [
   "Arial","Arial Black","Arial Narrow","Calibri","Cambria",
   "Century Gothic","Comic Sans MS","Consolas","Courier New",
   "Garamond","Georgia","Helvetica","Impact","Lucida Console",
   "Lucida Sans Unicode","Palatino Linotype","Segoe UI","Tahoma",
   "Times New Roman","Trebuchet MS","Verdana"
];

// ════════════════════════════════════════════════════════════
//  SETTINGS  (font sizes in tenths of a percent of image width)
// ════════════════════════════════════════════════════════════
var KEY = "NoctuaMark1";
function readStr(k,d){ var v=Settings.read(KEY+"/"+k,DataType_String); return Settings.lastReadOK?v:d; }
function readInt(k,d){ var v=Settings.read(KEY+"/"+k,DataType_Int32);  return Settings.lastReadOK?v:d; }

var cfg = {
   fontIdx         : readInt("fontIdx",        0),
   opacity         : readInt("opacity",        210),
   // Signature
   name            : readStr("name",           "Tarun Pulikanti"),
   handle          : readStr("handle",         "@hyderabadiastro"),
   year            : readStr("year",           new Date().getFullYear().toString()),
   sigSizeTenths   : readInt("sigSizeTenths",  15),
   sigBold         : readInt("sigBold",        0),
   sigColorR       : readInt("sigColorR",      255),
   sigColorG       : readInt("sigColorG",      215),
   sigColorB       : readInt("sigColorB",      0),
   sigPosX         : readInt("sigPosX",        50),
   sigPosY         : readInt("sigPosY",        93),
   // FITS
   showMeta        : readInt("showMeta",       0),
   metaSizeTenths  : readInt("metaSizeTenths", 7),
   metaLineSpacing : readInt("metaLineSpacing",140),
   metaColorR      : readInt("metaColorR",     200),
   metaColorG      : readInt("metaColorG",     200),
   metaColorB      : readInt("metaColorB",     200),
   metaPosX        : readInt("metaPosX",       3),
   metaPosY        : readInt("metaPosY",       82),
   fitsObject      : readStr("fitsObject",     ""),
   fitsDate        : readStr("fitsDate",       ""),
   fitsScope       : readStr("fitsScope",      ""),
   fitsCamera      : readStr("fitsCamera",     ""),
   fitsFilter      : readStr("fitsFilter",     ""),
   fitsFocal       : readStr("fitsFocal",      ""),
   fitsExp         : readStr("fitsExp",        ""),
   fitsTotal       : readStr("fitsTotal",      ""),
   fitsSite        : readStr("fitsSite",       ""),
   fitsBortle      : readStr("fitsBortle",     ""),
   // Description
   showDesc        : readInt("showDesc",       0),
   descText        : readStr("descText",       ""),
   descSizeTenths  : readInt("descSizeTenths", 7),
   descLineSpacing : readInt("descLineSpacing",140),
   descColorR      : readInt("descColorR",     210),
   descColorG      : readInt("descColorG",     210),
   descColorB      : readInt("descColorB",     210),
   descPosX        : readInt("descPosX",       3),
   descPosY        : readInt("descPosY",       68),
   // PNG
   showPng         : readInt("showPng",        0),
   pngPath         : readStr("pngPath",        ""),
   pngPosX         : readInt("pngPosX",        88),
   pngPosY         : readInt("pngPosY",        8),
   pngScale        : readInt("pngScale",       8),
   // Annotations
   showAnnot       : readInt("showAnnot",      0),
   annotationsJson : readStr("annotationsJson","[]")
};
if(cfg.fontIdx<0||cfg.fontIdx>=FONTS.length) cfg.fontIdx=0;

var annotations=[];
try{ annotations=JSON.parse(cfg.annotationsJson); }catch(e){ annotations=[]; }

function saveSettings(){
   cfg.annotationsJson=JSON.stringify(annotations);
   var p=[
      ["fontIdx",DataType_Int32,cfg.fontIdx],
      ["opacity",DataType_Int32,cfg.opacity],
      ["name",DataType_String,cfg.name],["handle",DataType_String,cfg.handle],
      ["year",DataType_String,cfg.year],
      ["sigSizeTenths",DataType_Int32,cfg.sigSizeTenths],
      ["sigBold",DataType_Int32,cfg.sigBold],
      ["sigColorR",DataType_Int32,cfg.sigColorR],["sigColorG",DataType_Int32,cfg.sigColorG],
      ["sigColorB",DataType_Int32,cfg.sigColorB],
      ["sigPosX",DataType_Int32,cfg.sigPosX],["sigPosY",DataType_Int32,cfg.sigPosY],
      ["showMeta",DataType_Int32,cfg.showMeta],
      ["metaSizeTenths",DataType_Int32,cfg.metaSizeTenths],
      ["metaLineSpacing",DataType_Int32,cfg.metaLineSpacing],
      ["metaColorR",DataType_Int32,cfg.metaColorR],["metaColorG",DataType_Int32,cfg.metaColorG],
      ["metaColorB",DataType_Int32,cfg.metaColorB],
      ["metaPosX",DataType_Int32,cfg.metaPosX],["metaPosY",DataType_Int32,cfg.metaPosY],
      ["fitsObject",DataType_String,cfg.fitsObject],["fitsDate",DataType_String,cfg.fitsDate],
      ["fitsScope",DataType_String,cfg.fitsScope],["fitsCamera",DataType_String,cfg.fitsCamera],
      ["fitsFilter",DataType_String,cfg.fitsFilter],["fitsFocal",DataType_String,cfg.fitsFocal],
      ["fitsExp",DataType_String,cfg.fitsExp],["fitsTotal",DataType_String,cfg.fitsTotal],
      ["fitsSite",DataType_String,cfg.fitsSite],["fitsBortle",DataType_String,cfg.fitsBortle],
      ["showDesc",DataType_Int32,cfg.showDesc],["descText",DataType_String,cfg.descText],
      ["descSizeTenths",DataType_Int32,cfg.descSizeTenths],
      ["descLineSpacing",DataType_Int32,cfg.descLineSpacing],
      ["descColorR",DataType_Int32,cfg.descColorR],["descColorG",DataType_Int32,cfg.descColorG],
      ["descColorB",DataType_Int32,cfg.descColorB],
      ["descPosX",DataType_Int32,cfg.descPosX],["descPosY",DataType_Int32,cfg.descPosY],
      ["showPng",DataType_Int32,cfg.showPng],["pngPath",DataType_String,cfg.pngPath],
      ["pngPosX",DataType_Int32,cfg.pngPosX],["pngPosY",DataType_Int32,cfg.pngPosY],
      ["pngScale",DataType_Int32,cfg.pngScale],
      ["showAnnot",DataType_Int32,cfg.showAnnot],
      ["annotationsJson",DataType_String,cfg.annotationsJson]
   ];
   for(var i=0;i<p.length;i++) Settings.write(KEY+"/"+p[i][0],p[i][1],p[i][2]);
}

// ════════════════════════════════════════════════════════════
//  FITS EXTRACTION
// ════════════════════════════════════════════════════════════
function safeKw(kw,n){
   for(var i=0;i<kw.length;i++)
      if(kw[i].name.toUpperCase()===n.toUpperCase()) return kw[i].strippedValue.trim();
   return "";
}
function extractAndPopulate(view){
   var kw=view.window.keywords;
   function fill(k,names){
      if(cfg[k]!=="") return;
      for(var i=0;i<names.length;i++){var v=safeKw(kw,names[i]);if(v!==""){cfg[k]=v;return;}}
   }
   fill("fitsObject",["OBJECT","TARGET"]);
   if(cfg.fitsDate===""){var d=safeKw(kw,"DATE-OBS")||safeKw(kw,"DATE-BEG")||"";if(d.length>=10)cfg.fitsDate=d.substring(0,10);}
   fill("fitsScope",["TELESCOP","TELESCOPE"]);
   fill("fitsCamera",["INSTRUME","CAMERA"]);
   fill("fitsFilter",["FILTER"]);
   if(cfg.fitsFocal===""){var fl=safeKw(kw,"FOCALLEN")||safeKw(kw,"FOCAL")||"";if(fl!=="")cfg.fitsFocal=Math.round(parseFloat(fl))+"mm";}
   if(cfg.fitsExp===""){var ex=safeKw(kw,"EXPTIME")||safeKw(kw,"EXPOSURE")||"";if(ex!=="")cfg.fitsExp=parseFloat(ex)+"s/frame";}
   if(cfg.fitsTotal===""){
      var tot=safeKw(kw,"TOTEXP")||safeKw(kw,"TOTALEXP")||"";
      if(tot!==""){var tv=parseFloat(tot);if(!isNaN(tv)){var h=Math.floor(tv/3600),mn=Math.floor((tv%3600)/60);cfg.fitsTotal=(h>0?h+"h ":"")+mn+"m total";}}
   }
   fill("fitsSite",["SITENAME","LOCATION"]);
   if(cfg.fitsBortle===""){var b=safeKw(kw,"BORTLE")||safeKw(kw,"SQM")||"";if(b!=="")cfg.fitsBortle="Bortle "+b;}
}
function buildMetaLines(){
   var out=[], fields=[cfg.fitsObject,cfg.fitsDate,cfg.fitsScope,cfg.fitsCamera,
                        cfg.fitsFilter,cfg.fitsFocal,cfg.fitsExp,cfg.fitsTotal,
                        cfg.fitsSite,cfg.fitsBortle];
   for(var i=0;i<fields.length;i++) if(fields[i].trim()!=="") out.push(fields[i].trim());
   return out;
}
function buildSigText(){ return "\u00A9 "+cfg.year+"   "+cfg.name+"   "+cfg.handle; }
function tenthsToPx(t,W){ return Math.max(4,Math.round(t*W/1000)); }

// ════════════════════════════════════════════════════════════
//  DRAWING HELPERS
// ════════════════════════════════════════════════════════════
function drawArrow(g,x1,y1,x2,y2,hl){
   g.drawLine(x1,y1,x2,y2);
   var a=Math.atan2(y2-y1,x2-x1),sp=0.42;
   g.drawLine(x2,y2,Math.round(x2-hl*Math.cos(a-sp)),Math.round(y2-hl*Math.sin(a-sp)));
   g.drawLine(x2,y2,Math.round(x2-hl*Math.cos(a+sp)),Math.round(y2-hl*Math.sin(a+sp)));
}
var SHD=[[-2,-2],[0,-2],[2,-2],[-2,0],[2,0],[-2,2],[0,2],[2,2]];
function drawTextShadowed(g,txt,tx,ty,r,gr,b,op){
   g.pen=new Pen(Color.rgbaColor(0,0,0,op));
   for(var i=0;i<SHD.length;i++) g.drawText(tx+SHD[i][0],ty+SHD[i][1],txt);
   g.pen=new Pen(Color.rgbaColor(r,gr,b,op));
   g.drawText(tx,ty,txt);
}
function drawParagraph(g,lines,fnt,r,gr,b,op,ax,ay,lsPct,W,H){
   g.font=fnt;
   var lh=Math.round(fnt.ascent*lsPct/100);
   for(var i=0;i<lines.length;i++){
      var txt=lines[i], ty=ay+i*lh+fnt.ascent;
      if(ty-fnt.ascent>H) break;
      var tx=Math.max(0,Math.min(W-fnt.width(txt),ax));
      drawTextShadowed(g,txt,tx,ty,r,gr,b,op);
   }
}

// ════════════════════════════════════════════════════════════
//  COMPOSITE RENDERER
// ════════════════════════════════════════════════════════════
function scaleAnnots(W,H){
   var out=[];
   for(var i=0;i<annotations.length;i++){
      var a=annotations[i];
      out.push({label:a.label,
         tx:Math.round(a.textX*W/100),ty:Math.round(a.textY*H/100),
         ax:Math.round(a.arrowX*W/100),ay:Math.round(a.arrowY*H/100),
         r:a.colorR,g:a.colorG,b:a.colorB,
         fpx:tenthsToPx(a.fontSizeTenths,W)});
   }
   return out;
}
function renderComposite(srcBmp,W,H,annots){
   var out=new Bitmap(W,H); out.assign(srcBmp);
   var g=new VectorGraphics(out);
   g.antialiasing=true; g.textAntialiasing=true;

   // PNG
   if(cfg.showPng===1 && cfg.pngPath!==""){
      try{
         var pb=new Bitmap(cfg.pngPath);
         var pw=Math.round(cfg.pngScale*W/100);
         var ph=Math.round(pw*pb.height/pb.width);
         var spb=pb.scaledTo(pw,ph);
         var px=Math.max(0,Math.min(W-pw,Math.round(cfg.pngPosX*W/100)-Math.round(pw/2)));
         var py=Math.max(0,Math.min(H-ph,Math.round(cfg.pngPosY*H/100)-Math.round(ph/2)));
         g.drawBitmap(px,py,spb);
      }catch(e){}
   }

   // Signature
   var sfpx=tenthsToPx(cfg.sigSizeTenths,W);
   var sfnt=new Font(FONTS[cfg.fontIdx],sfpx);
   if(cfg.sigBold===1) sfnt.bold=true;
   var stxt=buildSigText();
   g.font=sfnt;
   var stw=sfnt.width(stxt);
   var scx=Math.round(cfg.sigPosX*W/100),scy=Math.round(cfg.sigPosY*H/100);
   var stx=Math.max(0,Math.min(W-stw,scx-Math.round(stw/2)));
   var sty=Math.max(sfnt.ascent,Math.min(H-sfnt.descent,scy+Math.round(sfnt.ascent/2)));
   drawTextShadowed(g,stxt,stx,sty,cfg.sigColorR,cfg.sigColorG,cfg.sigColorB,cfg.opacity);

   // FITS paragraph
   if(cfg.showMeta===1){
      var ml=buildMetaLines();
      if(ml.length>0){
         var mfnt=new Font(FONTS[cfg.fontIdx],tenthsToPx(cfg.metaSizeTenths,W));
         drawParagraph(g,ml,mfnt,cfg.metaColorR,cfg.metaColorG,cfg.metaColorB,cfg.opacity,
            Math.round(cfg.metaPosX*W/100),Math.round(cfg.metaPosY*H/100),cfg.metaLineSpacing,W,H);
      }
   }

   // Description
   if(cfg.showDesc===1 && cfg.descText.trim()!==""){
      var dlines=cfg.descText.split("\n");
      var dfnt=new Font(FONTS[cfg.fontIdx],tenthsToPx(cfg.descSizeTenths,W));
      drawParagraph(g,dlines,dfnt,cfg.descColorR,cfg.descColorG,cfg.descColorB,cfg.opacity,
         Math.round(cfg.descPosX*W/100),Math.round(cfg.descPosY*H/100),cfg.descLineSpacing,W,H);
   }

   // Annotations
   for(var ai=0;ai<annots.length;ai++){
      var an=annots[ai];
      var afnt=new Font(FONTS[cfg.fontIdx],an.fpx);
      var pw2=Math.max(1,Math.round(an.fpx/14));
      var hl=Math.max(8,Math.round(an.fpx*0.9));
      g.pen=new Pen(Color.rgbaColor(0,0,0,200),pw2);
      drawArrow(g,an.tx+2,an.ty+2,an.ax+2,an.ay+2,hl);
      g.pen=new Pen(Color.rgbaColor(an.r,an.g,an.b,230),pw2);
      drawArrow(g,an.tx,an.ty,an.ax,an.ay,hl);
      g.font=afnt;
      var lx=Math.max(0,Math.min(W-afnt.width(an.label),an.tx-Math.round(afnt.width(an.label)/2)));
      var ly=Math.max(afnt.ascent,an.ty-afnt.descent-4);
      drawTextShadowed(g,an.label,lx,ly,an.r,an.g,an.b,230);
   }
   g.end();
   return out;
}

// ════════════════════════════════════════════════════════════
//  COLLAPSIBLE SECTION WIDGET
//  Returns an object with .container (the widget to add to layout)
//  and .setExpanded(bool) to collapse/expand programmatically.
// ════════════════════════════════════════════════════════════
function CollapsibleSection(parent, title, expanded){
   // Header button acts as toggle
   var btn=new PushButton(parent);
   btn.text=(expanded?"▼  ":"▶  ")+title;
   btn.flat=true;

   // Content frame shown/hidden
   var frame=new Frame(parent);
   frame.frameStyle=FrameStyle_Box;
   frame.visible=expanded;
   frame.sizer=new VerticalSizer;
   frame.sizer.margin=6;
   frame.sizer.spacing=5;

   var isOpen=expanded;
   btn.onClick=function(){
      isOpen=!isOpen;
      frame.visible=isOpen;
      btn.text=(isOpen?"▼  ":"▶  ")+title;
      // resize parent dialog
      if(parent.dialog) parent.dialog.adjustToContents();
   };

   return {
      header : btn,
      body   : frame,
      sizer  : frame.sizer,
      setExpanded:function(v){
         isOpen=v; frame.visible=v;
         btn.text=(v?"▼  ":"▶  ")+title;
      }
   };
}

// ════════════════════════════════════════════════════════════
//  DIALOG
// ════════════════════════════════════════════════════════════
function NoctuaMarkDialog(sourceView){
   this.__base__=Dialog;
   this.__base__();
   this.windowTitle="NoctuaMark v1.0  —  by Tarun Pulikanti @hyderabadiastro";
   this.userResizable=true;

   var self=this, applied=false;

   // Preview scale
   var imgW=sourceView.image.width, imgH=sourceView.image.height;
   var PW=460, PH=Math.round(PW*imgH/imgW);
   if(PH>300){PH=300;PW=Math.round(PH*imgW/imgH);}

   // Full-res source bitmap for zoom rendering
   var fullBmp=sourceView.image.render();  // actual image size
   var srcBmp=fullBmp.scaledTo(PW,PH);     // base preview size

   // ── Zoom / pan state ──────────────────────────────────────
   var zoomLevel = 1.0;          // 1.0 = fit, 2.0 = 2x, 4.0 = 4x …
   var ZOOM_STEPS = [1.0, 1.5, 2.0, 3.0, 4.0, 6.0, 8.0];
   var zoomIdx    = 0;
   var panX = 0, panY = 0;       // top-left offset of zoomed view in canvas px
   var isPanning  = false;
   var panSX=0, panSY=0, panOX=0, panOY=0;

   // Convert canvas (x,y) → preview-space (x,y) accounting for zoom+pan
   function canvasToPrev(cx,cy){
      return { x: Math.round((cx - panX) / zoomLevel),
               y: Math.round((cy - panY) / zoomLevel) };
   }
   // Convert preview-space → canvas
   function prevToCanvas(px,py){
      return { x: Math.round(px * zoomLevel + panX),
               y: Math.round(py * zoomLevel + panY) };
   }
   // Clamp pan so we never show grey outside image
   function clampPan(){
      var scaledW = Math.round(PW * zoomLevel);
      var scaledH = Math.round(PH * zoomLevel);
      var maxPanX = 0;
      var maxPanY = 0;
      var minPanX = Math.min(0, PW - scaledW);
      var minPanY = Math.min(0, PH - scaledH);
      panX = Math.max(minPanX, Math.min(maxPanX, panX));
      panY = Math.max(minPanY, Math.min(maxPanY, panY));
   }
   function zoomAroundPoint(cx, cy, newZoom){
      // Keep canvas point (cx,cy) fixed in preview coords
      var prevX = (cx - panX) / zoomLevel;
      var prevY = (cy - panY) / zoomLevel;
      zoomLevel = newZoom;
      panX = cx - prevX * zoomLevel;
      panY = cy - prevY * zoomLevel;
      clampPan();
   }

   // Drag state
   var dragLayer=null,dragSX=0,dragSY=0,dragOX=0,dragOY=0;
   var dragAnnot=null, placing=null;
   var HINT_NORMAL="Scroll wheel to zoom  |  Middle-click+drag to pan  |  Drag elements to reposition.";

   // Cached composite at preview resolution
   var currentBmp=null;

   this.updatePreview=function(){
      currentBmp=renderComposite(srcBmp,PW,PH,scaleAnnots(PW,PH));
      canvas.repaint();
   };

   // Canvas
   var canvas=new Frame(this);
   canvas.setFixedSize(PW,PH);
   canvas.frameStyle=FrameStyle_Box;

   canvas.onPaint=function(){
      if(!currentBmp) return;
      var g=new VectorGraphics(this);

      if(zoomLevel<=1.0){
         // No zoom — draw 1:1
         g.drawBitmap(0,0,currentBmp);
      } else {
         // Draw zoomed+panned slice
         // Source rect in currentBmp space
         var srcX = Math.round(-panX / zoomLevel);
         var srcY = Math.round(-panY / zoomLevel);
         var srcW = Math.round(PW / zoomLevel);
         var srcH = Math.round(PH / zoomLevel);
         // Clamp to bitmap bounds
         srcX = Math.max(0, Math.min(PW - 1, srcX));
         srcY = Math.max(0, Math.min(PH - 1, srcY));
         srcW = Math.max(1, Math.min(PW - srcX, srcW));
         srcH = Math.max(1, Math.min(PH - srcY, srcH));
         // Extract sub-bitmap and scale up to fill canvas
         var sub = currentBmp.subimage(srcX, srcY, srcW, srcH);
         var scaled = sub.scaledTo(PW, PH);
         g.drawBitmap(0,0,scaled);
      }

      // Placement crosshair
      if(placing && placing.phase==="arrow"){
         var cp=prevToCanvas(placing.textX,placing.textY);
         g.pen=new Pen(Color.rgbaColor(255,255,0,220),1);
         g.drawLine(cp.x-10,cp.y,cp.x+10,cp.y);
         g.drawLine(cp.x,cp.y-10,cp.x,cp.y+10);
      }

      // Zoom indicator
      if(zoomLevel>1.0){
         g.font=new Font(FontFamily_SansSerif,10);
         var zTxt="x"+zoomLevel.toFixed(1);
         g.pen=new Pen(Color.rgbaColor(0,0,0,180));
         g.drawText(9,19,zTxt);
         g.pen=new Pen(Color.rgbaColor(255,220,0,255));
         g.drawText(8,18,zTxt);
      }
      g.end();
   };

   function hitAnnot(x,y){
      var sa=scaleAnnots(PW,PH),R=12;
      for(var i=sa.length-1;i>=0;i--){
         if(Math.abs(x-sa[i].tx)<=R&&Math.abs(y-sa[i].ty)<=R) return{idx:i,part:"text"};
         if(Math.abs(x-sa[i].ax)<=R&&Math.abs(y-sa[i].ay)<=R) return{idx:i,part:"arrow"};
      }
      return null;
   }
   function hitLayer(x,y){
      var sfpx=tenthsToPx(cfg.sigSizeTenths,PW);
      var sf=new Font(FONTS[cfg.fontIdx],sfpx);
      if(Math.abs(x-Math.round(cfg.sigPosX*PW/100))<=sf.width(buildSigText())/2+8&&
         Math.abs(y-Math.round(cfg.sigPosY*PH/100))<=(sf.ascent+sf.descent)/2+8) return "sig";
      if(cfg.showMeta===1){
         var max2=Math.round(cfg.metaPosX*PW/100),may2=Math.round(cfg.metaPosY*PH/100);
         if(x>=max2-8&&x<=max2+220&&y>=may2-8&&y<=may2+60) return "meta";
      }
      if(cfg.showDesc===1&&cfg.descText.trim()!==""){
         var dax=Math.round(cfg.descPosX*PW/100),day=Math.round(cfg.descPosY*PH/100);
         if(x>=dax-8&&x<=dax+220&&y>=day-8&&y<=day+60) return "desc";
      }
      if(cfg.showPng===1&&cfg.pngPath!==""){
         var pcx=Math.round(cfg.pngPosX*PW/100),pcy=Math.round(cfg.pngPosY*PH/100);
         if(Math.abs(x-pcx)<=40&&Math.abs(y-pcy)<=40) return "png";
      }
      return null;
   }

   canvas.onMousePress=function(x,y,button){
      // Middle button = start pan
      if(button===2){isPanning=true;panSX=x;panSY=y;panOX=panX;panOY=panY;return;}
      if(button!==1) return;
      var pp=canvasToPrev(x,y); var px=pp.x,py=pp.y;
      if(placing){
         if(placing.phase==="text"){
            placing.textX=px;placing.textY=py;placing.phase="arrow";
            hintLbl.text="Step 2: Click the point the arrow should point TO.";
         } else {
            annotations.push({label:placing.label,
               textX:Math.round(placing.textX*100/PW),textY:Math.round(placing.textY*100/PH),
               arrowX:Math.round(px*100/PW),arrowY:Math.round(py*100/PH),
               colorR:placing.colorR,colorG:placing.colorG,colorB:placing.colorB,
               fontSizeTenths:placing.fontSizeTenths});
            placing=null;hintLbl.text=HINT_NORMAL;
            self.rebuildAnnotList();self.updatePreview();
         }
         canvas.repaint(); return;
      }
      var ah=hitAnnot(px,py);
      if(ah){dragAnnot=ah;dragSX=px;dragSY=py;return;}
      var lh=hitLayer(px,py);
      if(lh){
         dragLayer=lh;dragSX=px;dragSY=py;
         var ox={sig:[cfg.sigPosX,cfg.sigPosY],meta:[cfg.metaPosX,cfg.metaPosY],
                 desc:[cfg.descPosX,cfg.descPosY],png:[cfg.pngPosX,cfg.pngPosY]};
         dragOX=ox[lh][0];dragOY=ox[lh][1];
      }
   };
   canvas.onMouseRelease=function(x,y,button){
      if(button===2){isPanning=false;return;}
      dragAnnot=null;dragLayer=null;
   };
   canvas.onMouseMove=function(x,y){
      if(isPanning){
         panX=panOX+(x-panSX);panY=panOY+(y-panSY);
         clampPan();canvas.repaint();return;
      }
      var pp=canvasToPrev(x,y); var px=pp.x,py=pp.y;
      if(dragAnnot){
         var a=annotations[dragAnnot.idx];
         var dx=Math.round((px-dragSX)*100/PW),dy=Math.round((py-dragSY)*100/PH);
         if(dragAnnot.part==="text"){a.textX=Math.max(0,Math.min(100,a.textX+dx));a.textY=Math.max(0,Math.min(100,a.textY+dy));}
         else{a.arrowX=Math.max(0,Math.min(100,a.arrowX+dx));a.arrowY=Math.max(0,Math.min(100,a.arrowY+dy));}
         dragSX=px;dragSY=py;self.updatePreview();return;
      }
      if(dragLayer){
         var dx2=Math.round((px-dragSX)*100/PW),dy2=Math.round((py-dragSY)*100/PH);
         var nx=Math.max(0,Math.min(100,dragOX+dx2)),ny=Math.max(0,Math.min(100,dragOY+dy2));
         if(dragLayer==="sig") {cfg.sigPosX=nx;cfg.sigPosY=ny;}
         if(dragLayer==="meta"){cfg.metaPosX=nx;cfg.metaPosY=ny;}
         if(dragLayer==="desc"){cfg.descPosX=nx;cfg.descPosY=ny;}
         if(dragLayer==="png") {cfg.pngPosX=nx;cfg.pngPosY=ny;}
         self.updatePreview();
      }
   };
   canvas.onMouseWheel=function(x,y,delta){
      var dir=delta>0?1:-1;
      var newIdx=Math.max(0,Math.min(ZOOM_STEPS.length-1,zoomIdx+dir));
      if(newIdx===zoomIdx) return;
      zoomIdx=newIdx;
      zoomAroundPoint(x,y,ZOOM_STEPS[zoomIdx]);
      canvas.repaint();
   };
   canvas.trackMouse=true;

   // ── UI helpers ───────────────────────────────────────────
   function mkL(txt,w){
      var l=new Label(self);l.text=txt;
      if(w)l.setFixedWidth(w);
      l.textAlignment=TextAlign_Right|TextAlign_VertCenter;
      return l;
   }
   function mkER(lt,val,cb){
      var lbl=mkL(lt,118),ed=new Edit(self);ed.text=val;if(cb)ed.onTextUpdated=cb;
      var r=new HorizontalSizer;r.spacing=5;r.add(lbl);r.add(ed,100);
      return{row:r,edit:ed};
   }
   function mkSzRow(lt,getV,setV){
      var lbl=mkL(lt,118),sp=new SpinBox(self);
      sp.setRange(1,100);sp.value=getV();
      sp.toolTip="Font size in tenths of a percent of image width.\n1=0.1%, 10=1.0%, 15=1.5%, 25=2.5%";
      var nl=new Label(self);nl.setFixedWidth(52);nl.textAlignment=TextAlign_Left|TextAlign_VertCenter;
      function upN(v){nl.text=" ="+( v/10).toFixed(1)+"%";}upN(getV());
      sp.onValueUpdated=function(v){setV(v);upN(v);self.updatePreview();};
      var r=new HorizontalSizer;r.spacing=5;r.add(lbl);r.add(sp);r.add(nl);r.addStretch();
      return{row:r,spin:sp};
   }
   function mkLsRow(lt,getV,setV){
      var lbl=mkL(lt,118),sp=new SpinBox(self);
      sp.setRange(100,300);sp.value=getV();
      sp.toolTip="Line spacing: 100=tight, 140=normal, 200=double";
      sp.onValueUpdated=function(v){setV(v);self.updatePreview();};
      var r=new HorizontalSizer;r.spacing=5;r.add(lbl);r.add(sp);r.addStretch();
      return{row:r,spin:sp};
   }
   function mkColorBlock(lt,getR,setR,getG,setG,getB,setB,cb){
      function sl(ch,gV,sV){
         var lb=mkL(ch,10),s=new Slider(self);s.setRange(0,255);s.value=gV();s.setMinWidth(80);
         var vl=new Label(self);vl.setFixedWidth(20);vl.text=String(gV());
         vl.textAlignment=TextAlign_Right|TextAlign_VertCenter;
         s.onValueUpdated=function(v){sV(v);vl.text=String(v);cb();};
         var r=new HorizontalSizer;r.spacing=3;r.add(lb);r.add(s,100);r.add(vl);return r;
      }
      var col=new VerticalSizer;col.spacing=3;
      col.add(sl("R",getR,setR));col.add(sl("G",getG,setG));col.add(sl("B",getB,setB));
      var row=new HorizontalSizer;row.spacing=5;row.add(mkL(lt,118));row.add(col,100);
      return row;
   }

   // ── Global settings row (always visible) ─────────────────
   var fontCombo=new ComboBox(this);
   for(var fi=0;fi<FONTS.length;fi++) fontCombo.addItem(FONTS[fi]);
   fontCombo.currentItem=cfg.fontIdx;
   fontCombo.onItemSelected=function(i){cfg.fontIdx=i;self.updatePreview();};
   var fontRow=new HorizontalSizer;fontRow.spacing=5;
   fontRow.add(mkL("Font (all layers):",118));fontRow.add(fontCombo,100);

   var opSl=new Slider(this);opSl.setRange(0,255);opSl.value=cfg.opacity;opSl.setMinWidth(80);
   var opVl=new Label(this);opVl.setFixedWidth(20);opVl.text=String(cfg.opacity);
   opVl.textAlignment=TextAlign_Right|TextAlign_VertCenter;
   opSl.onValueUpdated=function(v){cfg.opacity=v;opVl.text=String(v);self.updatePreview();};
   var opRow=new HorizontalSizer;opRow.spacing=5;
   opRow.add(mkL("Global Opacity:",118));opRow.add(opSl,100);opRow.add(opVl);

   var globalBox=new Frame(this);globalBox.frameStyle=FrameStyle_Box;
   globalBox.sizer=new VerticalSizer;globalBox.sizer.margin=6;globalBox.sizer.spacing=5;
   globalBox.sizer.add(fontRow);globalBox.sizer.add(opRow);

   // ── SECTION: Signature ───────────────────────────────────
   var secSig=new CollapsibleSection(this,"Signature",true);
   secSig.header.dialog=this;
   var nameW  =mkER("Name:",          cfg.name,   function(t){cfg.name  =t;self.updatePreview();});
   var handleW=mkER("Handle / Tag:",  cfg.handle, function(t){cfg.handle=t;self.updatePreview();});
   var yearW  =mkER("Copyright Year:",cfg.year,   function(t){cfg.year  =t;self.updatePreview();});
   var sigSzW =mkSzRow("Font Size:",  function(){return cfg.sigSizeTenths;}, function(v){cfg.sigSizeTenths=v;});
   var boldChk=new CheckBox(this);boldChk.text="Bold";boldChk.checked=cfg.sigBold===1;
   boldChk.onCheck=function(v){cfg.sigBold=v?1:0;self.updatePreview();};
   var boldRow=new HorizontalSizer;boldRow.spacing=5;boldRow.add(mkL("",118));boldRow.add(boldChk);boldRow.addStretch();
   var sigColRow=mkColorBlock("Colour:",
      function(){return cfg.sigColorR;},function(v){cfg.sigColorR=v;},
      function(){return cfg.sigColorG;},function(v){cfg.sigColorG=v;},
      function(){return cfg.sigColorB;},function(v){cfg.sigColorB=v;},
      function(){self.updatePreview();});
   secSig.sizer.add(nameW.row);secSig.sizer.add(handleW.row);secSig.sizer.add(yearW.row);
   secSig.sizer.add(sigSzW.row);secSig.sizer.add(boldRow);secSig.sizer.add(sigColRow);

   // ── SECTION: FITS Metadata ───────────────────────────────
   var secMeta=new CollapsibleSection(this,"FITS / XISF Metadata Paragraph",false);
   secMeta.header.dialog=this;
   var metaEnableChk=new CheckBox(this);metaEnableChk.text="Enable metadata paragraph";
   metaEnableChk.checked=cfg.showMeta===1;
   metaEnableChk.onCheck=function(v){cfg.showMeta=v?1:0;self.updatePreview();};
   var fObj=mkER("Object / Target:", cfg.fitsObject, function(t){cfg.fitsObject=t;self.updatePreview();});
   var fDat=mkER("Date Observed:",   cfg.fitsDate,   function(t){cfg.fitsDate  =t;self.updatePreview();});
   var fScp=mkER("Telescope:",       cfg.fitsScope,  function(t){cfg.fitsScope =t;self.updatePreview();});
   var fCam=mkER("Camera:",          cfg.fitsCamera, function(t){cfg.fitsCamera=t;self.updatePreview();});
   var fFlt=mkER("Filter:",          cfg.fitsFilter, function(t){cfg.fitsFilter=t;self.updatePreview();});
   var fFoc=mkER("Focal Length:",    cfg.fitsFocal,  function(t){cfg.fitsFocal =t;self.updatePreview();});
   var fExp=mkER("Exposure/frame:",  cfg.fitsExp,    function(t){cfg.fitsExp   =t;self.updatePreview();});
   var fTot=mkER("Total Integ.:",    cfg.fitsTotal,  function(t){cfg.fitsTotal =t;self.updatePreview();});
   var fSit=mkER("Location/Site:",   cfg.fitsSite,   function(t){cfg.fitsSite  =t;self.updatePreview();});
   var fBor=mkER("Bortle / SQM:",    cfg.fitsBortle, function(t){cfg.fitsBortle=t;self.updatePreview();});
   var metaSzW=mkSzRow("Font Size:",  function(){return cfg.metaSizeTenths;}, function(v){cfg.metaSizeTenths=v;});
   var metaLsW=mkLsRow("Line Spacing:", function(){return cfg.metaLineSpacing;}, function(v){cfg.metaLineSpacing=v;});
   var metaColRow=mkColorBlock("Colour:",
      function(){return cfg.metaColorR;},function(v){cfg.metaColorR=v;},
      function(){return cfg.metaColorG;},function(v){cfg.metaColorG=v;},
      function(){return cfg.metaColorB;},function(v){cfg.metaColorB=v;},
      function(){self.updatePreview();});
   secMeta.sizer.add(metaEnableChk);
   secMeta.sizer.add(fObj.row);secMeta.sizer.add(fDat.row);secMeta.sizer.add(fScp.row);
   secMeta.sizer.add(fCam.row);secMeta.sizer.add(fFlt.row);secMeta.sizer.add(fFoc.row);
   secMeta.sizer.add(fExp.row);secMeta.sizer.add(fTot.row);
   secMeta.sizer.add(fSit.row);secMeta.sizer.add(fBor.row);
   secMeta.sizer.add(metaSzW.row);secMeta.sizer.add(metaLsW.row);secMeta.sizer.add(metaColRow);

   // ── SECTION: Description ─────────────────────────────────
   var secDesc=new CollapsibleSection(this,"Description / Caption Block",false);
   secDesc.header.dialog=this;
   var descEnableChk=new CheckBox(this);descEnableChk.text="Enable description block";
   descEnableChk.checked=cfg.showDesc===1;
   descEnableChk.onCheck=function(v){cfg.showDesc=v?1:0;self.updatePreview();};
   var descEdit=new TextBox(this);descEdit.text=cfg.descText;descEdit.setFixedHeight(72);
   descEdit.toolTip="Each line is rendered as a separate line on the image.";
   descEdit.onTextUpdated=function(){cfg.descText=descEdit.text;self.updatePreview();};
   var descSzW=mkSzRow("Font Size:",  function(){return cfg.descSizeTenths;}, function(v){cfg.descSizeTenths=v;});
   var descLsW=mkLsRow("Line Spacing:", function(){return cfg.descLineSpacing;}, function(v){cfg.descLineSpacing=v;});
   var descColRow=mkColorBlock("Colour:",
      function(){return cfg.descColorR;},function(v){cfg.descColorR=v;},
      function(){return cfg.descColorG;},function(v){cfg.descColorG=v;},
      function(){return cfg.descColorB;},function(v){cfg.descColorB=v;},
      function(){self.updatePreview();});
   secDesc.sizer.add(descEnableChk);secDesc.sizer.add(descEdit);
   secDesc.sizer.add(descSzW.row);secDesc.sizer.add(descLsW.row);secDesc.sizer.add(descColRow);

   // ── SECTION: PNG Logo ────────────────────────────────────
   var secPng=new CollapsibleSection(this,"PNG Logo / Watermark",false);
   secPng.header.dialog=this;
   var pngEnableChk=new CheckBox(this);pngEnableChk.text="Enable PNG logo";
   pngEnableChk.checked=cfg.showPng===1;
   pngEnableChk.onCheck=function(v){cfg.showPng=v?1:0;self.updatePreview();};
   var pngEdit=new Edit(this);pngEdit.text=cfg.pngPath;pngEdit.readOnly=true;
   var pngBrowse=new PushButton(this);pngBrowse.text="Browse…";pngBrowse.setFixedWidth(68);
   pngBrowse.onClick=function(){
      var fd=new OpenFileDialog();fd.caption="Select PNG";
      fd.filters=[["PNG Images","*.png"],["All Files","*"]];
      if(fd.execute()){cfg.pngPath=fd.fileName;pngEdit.text=cfg.pngPath;self.updatePreview();}
   };
   var pngClear=new PushButton(this);pngClear.text="✕";pngClear.setFixedWidth(30);
   pngClear.onClick=function(){cfg.pngPath="";pngEdit.text="";self.updatePreview();};
   var pngFileRow=new HorizontalSizer;pngFileRow.spacing=4;
   pngFileRow.add(mkL("PNG File:",118));pngFileRow.add(pngEdit,100);pngFileRow.add(pngBrowse);pngFileRow.add(pngClear);
   var pngSzSp=new SpinBox(this);pngSzSp.setRange(1,50);pngSzSp.value=cfg.pngScale;
   pngSzSp.toolTip="PNG width as % of image width";
   pngSzSp.onValueUpdated=function(v){cfg.pngScale=v;self.updatePreview();};
   var pngSzRow=new HorizontalSizer;pngSzRow.spacing=5;
   pngSzRow.add(mkL("PNG Width (% img):",118));pngSzRow.add(pngSzSp);pngSzRow.addStretch();
   secPng.sizer.add(pngEnableChk);secPng.sizer.add(pngFileRow);secPng.sizer.add(pngSzRow);

   // ── SECTION: Annotations ─────────────────────────────────
   var secAnnot=new CollapsibleSection(this,"Annotations (Arrow + Label)",false);
   secAnnot.header.dialog=this;
   var annColorR=255,annColorG=255,annColorB=0,annFontTenths=8;
   var annLblW=mkER("Label text:","New Label",null);
   var annSzW=mkSzRow("Font Size:", function(){return annFontTenths;}, function(v){annFontTenths=v;});
   var annColRow=mkColorBlock("Arrow Colour:",
      function(){return annColorR;},function(v){annColorR=v;},
      function(){return annColorG;},function(v){annColorG=v;},
      function(){return annColorB;},function(v){annColorB=v;},
      function(){});
   var addAnnotBtn=new PushButton(this);
   addAnnotBtn.text="+ Add Annotation — click preview to place";
   addAnnotBtn.onClick=function(){
      placing={phase:"text",label:annLblW.edit.text.trim()||"Label",
               colorR:annColorR,colorG:annColorG,colorB:annColorB,fontSizeTenths:annFontTenths};
      hintLbl.text="Step 1: Click where the LABEL should appear.";
   };
   var annotTB=new TextBox(this);annotTB.readOnly=true;annotTB.setFixedHeight(68);
   this.rebuildAnnotList=function(){
      var lines=[];
      for(var i=0;i<annotations.length;i++){
         var a=annotations[i];
         lines.push((i+1)+'. "'+a.label+'"  text:('+a.textX+'%,'+a.textY+'%)  →('+a.arrowX+'%,'+a.arrowY+'%)');
      }
      annotTB.text=lines.join("\n");
   };
   this.rebuildAnnotList();
   var delSp=new SpinBox(this);delSp.setRange(1,999);delSp.value=1;
   var delBtn=new PushButton(this);delBtn.text="Delete #";
   delBtn.onClick=function(){var idx=delSp.value-1;if(idx>=0&&idx<annotations.length){annotations.splice(idx,1);self.rebuildAnnotList();self.updatePreview();}};
   var delAllBtn=new PushButton(this);delAllBtn.text="Delete All";
   delAllBtn.onClick=function(){annotations=[];self.rebuildAnnotList();self.updatePreview();};
   var delRow=new HorizontalSizer;delRow.spacing=5;
   delRow.add(mkL("Delete #:",118));delRow.add(delSp);delRow.add(delBtn);delRow.add(delAllBtn);delRow.addStretch();
   secAnnot.sizer.add(annLblW.row);secAnnot.sizer.add(annSzW.row);
   secAnnot.sizer.add(annColRow);secAnnot.sizer.add(addAnnotBtn);
   secAnnot.sizer.add(annotTB);secAnnot.sizer.add(delRow);

   // ── Hint ─────────────────────────────────────────────────
   var hintLbl=new Label(this);
   hintLbl.text=HINT_NORMAL;
   hintLbl.textAlignment=TextAlign_HorzCenter|TextAlign_VertCenter;

   // ── Credits bar ──────────────────────────────────────────
   var creditsLbl=new Label(this);
   creditsLbl.text="NoctuaMark v1.0  |  Created by Tarun Pulikanti  |  @hyderabadiastro";
   creditsLbl.textAlignment=TextAlign_HorzCenter|TextAlign_VertCenter;

   // ── Buttons ──────────────────────────────────────────────
   var applyBtn=new PushButton(this);applyBtn.text="  Apply Watermark  ";applyBtn.defaultButton=true;
   applyBtn.onClick=function(){
      cfg.name=nameW.edit.text;cfg.handle=handleW.edit.text;cfg.year=yearW.edit.text;
      cfg.fontIdx=fontCombo.currentItem;cfg.opacity=opSl.value;
      cfg.pngScale=pngSzSp.value;cfg.descText=descEdit.text;
      saveSettings();applied=true;self.done(1);
   };
   var resetBtn=new PushButton(this);resetBtn.text="Reset Positions";
   resetBtn.onClick=function(){
      cfg.sigPosX=50;cfg.sigPosY=93;cfg.metaPosX=3;cfg.metaPosY=82;
      cfg.descPosX=3;cfg.descPosY=68;cfg.pngPosX=88;cfg.pngPosY=8;
      annotations=[];self.rebuildAnnotList();self.updatePreview();
   };
   var cancelBtn=new PushButton(this);cancelBtn.text="Cancel";
   cancelBtn.onClick=function(){self.done(0);};
   var btnRow=new HorizontalSizer;btnRow.spacing=8;
   btnRow.add(resetBtn);btnRow.addStretch();btnRow.add(cancelBtn);btnRow.add(applyBtn);

   // ── Left column: collapsible sections ────────────────────
   var leftCol=new VerticalSizer;leftCol.margin=0;leftCol.spacing=4;
   leftCol.add(globalBox);
   leftCol.add(secSig.header);  leftCol.add(secSig.body);
   leftCol.add(secMeta.header); leftCol.add(secMeta.body);
   leftCol.add(secDesc.header); leftCol.add(secDesc.body);
   leftCol.add(secPng.header);  leftCol.add(secPng.body);
   leftCol.add(secAnnot.header);leftCol.add(secAnnot.body);
   leftCol.addStretch();

   // ── Right column: preview ────────────────────────────────
   var prevTitleLbl=new Label(this);
   prevTitleLbl.text="Live Preview — drag any element to reposition";
   prevTitleLbl.textAlignment=TextAlign_HorzCenter|TextAlign_VertCenter;
   // Zoom toolbar
   var zoomInBtn=new PushButton(self);zoomInBtn.text="  +  ";zoomInBtn.setFixedWidth(36);
   zoomInBtn.toolTip="Zoom In (or scroll wheel up)";
   zoomInBtn.onClick=function(){
      var ni=Math.min(ZOOM_STEPS.length-1,zoomIdx+1);
      if(ni===zoomIdx) return;
      zoomIdx=ni; zoomAroundPoint(PW/2,PH/2,ZOOM_STEPS[zoomIdx]); canvas.repaint();
   };
   var zoomOutBtn=new PushButton(self);zoomOutBtn.text="  −  ";zoomOutBtn.setFixedWidth(36);
   zoomOutBtn.toolTip="Zoom Out (or scroll wheel down)";
   zoomOutBtn.onClick=function(){
      var ni=Math.max(0,zoomIdx-1);
      if(ni===zoomIdx) return;
      zoomIdx=ni; zoomAroundPoint(PW/2,PH/2,ZOOM_STEPS[zoomIdx]); canvas.repaint();
   };
   var zoomFitBtn=new PushButton(self);zoomFitBtn.text="Fit";zoomFitBtn.setFixedWidth(36);
   zoomFitBtn.toolTip="Reset to fit view";
   zoomFitBtn.onClick=function(){zoomIdx=0;zoomLevel=1.0;panX=0;panY=0;canvas.repaint();};
   var zoom2Btn=new PushButton(self);zoom2Btn.text="2x";zoom2Btn.setFixedWidth(36);
   zoom2Btn.toolTip="Jump to 2x zoom";
   zoom2Btn.onClick=function(){zoomIdx=2;zoomAroundPoint(PW/2,PH/2,ZOOM_STEPS[2]);canvas.repaint();};
   var zoom4Btn=new PushButton(self);zoom4Btn.text="4x";zoom4Btn.setFixedWidth(36);
   zoom4Btn.toolTip="Jump to 4x zoom";
   zoom4Btn.onClick=function(){zoomIdx=3;zoomAroundPoint(PW/2,PH/2,ZOOM_STEPS[3]);canvas.repaint();};

   var zoomBar=new HorizontalSizer;zoomBar.spacing=4;
   var zoomLbl=new Label(self);zoomLbl.text="Zoom:";
   zoomLbl.textAlignment=TextAlign_Right|TextAlign_VertCenter;
   zoomBar.add(zoomLbl);
   zoomBar.add(zoomOutBtn);zoomBar.add(zoomInBtn);
   zoomBar.add(zoomFitBtn);zoomBar.add(zoom2Btn);zoomBar.add(zoom4Btn);
   zoomBar.addStretch();
   var panHintLbl=new Label(self);
   panHintLbl.text="Middle-click + drag to pan when zoomed";
   panHintLbl.textAlignment=TextAlign_Right|TextAlign_VertCenter;
   zoomBar.add(panHintLbl);

   var rightCol=new VerticalSizer;rightCol.spacing=4;
   rightCol.add(prevTitleLbl);rightCol.add(canvas);rightCol.add(zoomBar);rightCol.add(hintLbl);rightCol.addStretch();

   var bodyRow=new HorizontalSizer;bodyRow.margin=0;bodyRow.spacing=10;
   bodyRow.add(leftCol);bodyRow.add(rightCol);

   this.sizer=new VerticalSizer;this.sizer.margin=10;this.sizer.spacing=6;
   this.sizer.add(bodyRow);
   this.sizer.add(creditsLbl);
   this.sizer.add(btnRow);

   this.adjustToContents();
   this.updatePreview();
   this.wasApplied=function(){return applied;};
}
NoctuaMarkDialog.prototype=new Dialog;

// ════════════════════════════════════════════════════════════
//  APPLY TO FULL IMAGE
// ════════════════════════════════════════════════════════════
function applyToImage(view){
   var W=view.image.width,H=view.image.height;
   var out=renderComposite(view.image.render(),W,H,scaleAnnots(W,H));
   view.beginProcess(0x00000000);
   view.image.blend(out);
   view.endProcess();
   Console.writeln("<end><cbr>NoctuaMark v1.0 applied to ["+view.id+"]");
   Console.writeln("  Sig: "+FONTS[cfg.fontIdx]+" "+tenthsToPx(cfg.sigSizeTenths,W)+"px");
   Console.writeln("  Annotations: "+annotations.length);
   Console.writeln("  Created by Tarun Pulikanti @hyderabadiastro");
}

// ════════════════════════════════════════════════════════════
//  ENTRY POINT
// ════════════════════════════════════════════════════════════
function main(){
   if(ImageWindow.windows.length===0){
      (new MessageBox("No image is open.","NoctuaMark",StdIcon_Error,StdButton_Ok)).execute();return;
   }
   var win=ImageWindow.activeWindow;
   if(win===null||win.isNull){
      (new MessageBox("No active image window.","NoctuaMark",StdIcon_Error,StdButton_Ok)).execute();return;
   }
   extractAndPopulate(win.mainView);
   var dlg=new NoctuaMarkDialog(win.mainView);
   dlg.execute();
   if(dlg.wasApplied()){applyToImage(win.mainView);Console.show();}
}
main();
