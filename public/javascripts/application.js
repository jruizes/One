// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
// 6.2645966700,-75.5877166080;

// The Javascript Menu and its functions is based on code provided by the
// Community Church Javascript Team
// http://www.bisphamchurch.org.uk/
// http://econym.org.uk/gmap/

//function init(){
$(document).ready(function(){

 if(GBrowserIsCompatible){

  var centerLatitude = 6.158056953;
  var centerLongitude = -75.595050354;
  var startZoom = 14;
  var lat;
  var lng;
  var point;
  var countInitial=0;
  var countFinal=0;
  var latlng_street=[];
  var latlng_bus=[];
  var latlng_metro=[];
  var map;

  var divheader=document.getElementById("header");
  var inputForm = document.createElement("form");
  inputForm.setAttribute("action","");
  inputForm.id='input_points';
  inputForm.onsubmit = function() {findRoute(); return false;};

  inputForm.innerHTML=
    '<fieldset style="width:1000px;">'
    + '<legend>Puntos</legend>'
    + '<label for="initial_point">Punto Inicial</label>'
    + '<input type="text" id="initial_point" name="initial_point" style="width:280px;"/>'
    + '<label for="end_point">Punto Final</label>'
    + '<input type="text" id="end_point" name="end_point" style="width:280px;"/>'
    + '<p><input type="submit" value="Get Directions!"/></p>'
    + '</fieldset>';
  divheader.appendChild(inputForm);
  document.getElementById("initial_point").value='';
  document.getElementById("end_point").value='';
  document.getElementById("initial_point").setAttribute("readonly","readonly");
  document.getElementById("end_point").setAttribute("readonly","readonly");

  map = new GMap2(document.getElementById("content"));
  map.addControl(new GMapTypeControl());
  map.addControl(new GSmallMapControl());
  map.setMapType(G_SATELLITE_MAP);
  map.setCenter(new GLatLng(centerLatitude,centerLongitude),startZoom);

  var contextmenu = document.createElement("div");
  contextmenu.style.visibility="hidden";
  contextmenu.style.background="#ffffff";
  contextmenu.style.border="1px solid #8888FF";
  contextmenu.innerHTML =
    '<a href="javascript:void(0)"  id="initial_point_func"><div class="context">Ruta desde aquí</div></a>'
    +'<a href="javascript:void(0)" id="end_point_func"><div class="context">Ruta hasta aquí</div></a>'
    +'<a href="javascript:void(0)" id="zoomin_func"><div class="context">Zoom In</div></a>'
    +'<a href="javascript:void(0)" id="zoomout_func"><div class="context">Zoom Out</div></a>'
    +'<a href="javascript:void(0)" id="centerMap_func"><div class="context">Center map</div></a>'
    +'<a href="javascript:void(0)" id="clearMarkers_func"><div class="context">Reiniciar origen/destino </div></a>'
  map.getContainer().appendChild(contextmenu);

  //Evento para desplegar menú cuando se hace click izquierdo
  GEvent.addListener(map,"singlerightclick",function(pixel,tile) {
    // store the "pixel" info in case we need it later
    // adjust the context menu location if near an egde
    // create a GControlPosition
    // apply it to the context menu, and make the context menu visible
    var clickedPixel = pixel;
    var x=pixel.x;
    var y=pixel.y;

    if (x > map.getSize().width - 120) { x = map.getSize().width - 120 }
    if (y > map.getSize().height - 100) { y = map.getSize().height - 100 }
    var pos = new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(x,y));
    pos.apply(contextmenu);
    contextmenu.style.visibility = "visible";
    point=map.fromContainerPixelToLatLng(clickedPixel);
    lat=point.lat();
    lng=point.lng();

  });

  document.getElementById('initial_point_func').onclick=function(){getInitialPoint();return false;};
  document.getElementById('end_point_func').onclick=function(){getFinalPoint();return false;};
  document.getElementById('zoomin_func').onclick=function(){zoomIn();return false;};
  document.getElementById('zoomout_func').onclick=function(){zoomOut();return false;};
  document.getElementById('centerMap_func').onclick=function(){setCenter();return false;};
  document.getElementById('clearMarkers_func').onclick=function(){clearMarkers();return false;};


  function getInitialPoint() {
    if(countInitial==0){
        var marker = new GMarker(point,{draggable:true});
        map.addOverlay(marker);
        document.getElementById("initial_point").value=lat+','+lng;
        contextmenu.style.visibility="hidden";
        countInitial=1;

      GEvent.addListener(marker, "dragend", function() {
        document.getElementById("initial_point").value=marker.getPoint().lat()+","+marker.getPoint().lng();

      });
    }
  }


  function getFinalPoint() {
    if(countFinal==0){
        var marker = new GMarker(point,{draggable:true});
        map.addOverlay(marker);
        document.getElementById("end_point").value=lat+','+lng;
        contextmenu.style.visibility="hidden";
        countFinal=1;

        GEvent.addListener(marker, "dragend", function() {
         document.getElementById("end_point").value=marker.getPoint().lat()+","+marker.getPoint().lng();
        });
     }
  }


  function zoomIn() {
    // perform the requested operation
    map.zoomIn();
    // hide the context menu now that it has been used
    contextmenu.style.visibility="hidden";
  }


  function zoomOut() {
    map.zoomOut();
    contextmenu.style.visibility="hidden";
  }


  function setCenter(){
      map.setCenter(point);
  }


  function clearMarkers(){
    map.clearOverlays();
    document.getElementById("initial_point").value='';
    document.getElementById("end_point").value='';
    countInitial=0;
    countFinal=0;
    contextmenu.style.visibility="hidden";
  }


  GEvent.addListener(map,'click',function(overlay,latlng) {
   // Remove one single marker
   /* if(overlay) {
      map.removeOverlay(overlay);
    }*/
    contextmenu.style.visibility="hidden";
  });


  function findRoute(){

    var init_lat_lng = document.getElementById("initial_point").value;
    var end_lat_lng = document.getElementById("end_point").value;
    var getVars = "?initial_point="+init_lat_lng+"&end_point="+end_lat_lng;

    var request = GXmlHttp.create();
    request.open('GET', 'calcular'+getVars,true);
    request.onreadystatechange = function() {
      if(request.readyState == 4){

         var success=false;
         var content="Error contacting web service";
         try{
             res=eval("(" + request.responseText + ")" );
             content=res.content;
             success=res.success;
         }catch (e){
          success=false;
         }
         if(!success) {alert(content);}
         else{
          //console.debug("el length " + content.length)
           bearing(6.2645966700,-75.5877166080,6.2628485150,-75.5888434600);
           for(var i=0;i<content.length;i++){
         //   var roadmap_id=content[i].roadmap_id;
          //  var maproad_related_id=content[i].roadmap_related_id;
            var lat_start=content[i].lat_start;
            var long_start=content[i].long_start;
            var lat_end=content[i].lat_end;
            var long_end=content[i].long_end;
            var stretch_type=content[i].stretch_type;
          /*  console.debug("el roadmap id " + roadmap_id);
            console.debug("el related " + maproad_related_id);*/
           // console.debug("el lat_start " + lat_start);
           // console.debug("el long_start " + long_start);
            //console.debug("el lat_end " + lat_end);
           // console.debug("el long_end " + long_end);
            //console.debug("el stretch_type " + stretch_type);
            //Se adiciona solo el inicial, porque la lat/long final del nodo i es igual*/
            //a la lat/long inicial del nodo i+1
            latlng_street.push(new GLatLng(lat_start,long_start));
            bearing(lat_start,long_start,lat_end,long_end);
            if(stretch_type > 2)
              latlng_metro.push(new GLatLng(lat_start,long_start));

            }
            //Se adiciona el ulitmo trayecto
            latlng_street.push(new GLatLng(lat_end,long_end));
            drawpolyline();
          }
      }
    }
    request.send(null);
    return false;
  }

  function bearing(lat_start,long_start,lat_end,long_end){
    var toRad=Math.PI/180;
    var lat1 = lat_start*toRad;
    var long1 = long_start*toRad;
    var lat2 = lat_end*toRad;
    var long2 = long_end*toRad;

    var y = (Math.cos(lat1)*Math.sin(lat2))-( Math.sin(lat1)*Math.cos(lat2)*Math.cos(long2-long1))
    var x = Math.sin(long2-long1)*Math.cos(lat2);
    var brng = Math.atan2(x,y)%(2*Math.PI);
    brng  = brng*(180/Math.PI);
    if(brng < 0 ){brng = brng + 360;} //Convertir grados positivos a negativos
    direction=getDirection(brng);
    console.debug("Los grados para los puntos: inicial-> " + lat_start + " " + long_start +
    " final-> " + lat_end + " " + long_end + " son: " +  brng);
    console.debug("La direcion es: " + direction);
  }

  function drawpolyline(){
    var polyline = new GPolyline(latlng_street,'#FF6633',4,0.8);
    map.addOverlay(polyline);
    var polyline_metro = new GPolyline(latlng_metro,'#D0B132',6,0.5);
    map.addOverlay(polyline_metro);
  }

  function explainRoute(){}

  function getDirection(bearing){
    var direction;
    if( (bearing >= 0 && bearing <= 22.5) || (bearing>337.5 && bearing<360))
    {direction="Norte"}
    else if (bearing > 22.5 && bearing <= 66.5 ){direction="Noreste"}
    else if (bearing > 66.5 && bearing <= 115 ){direction="Este"}
    else if (bearing > 115 && bearing <= 157.5 ){direction="Sureste"}
    else if (bearing > 157.5 && bearing <= 202.5 ){direction="Sur"}
    else if (bearing > 202.5 && bearing <= 247.5 ){direction="Suroeste"}
    else if (bearing > 247.5 && bearing <= 292.5 ){direction="Oeste"}
    else if (bearing > 292.5 && bearing <=337.5  ){direction="Noroeste"}

    return direction;

  }


 }else{alert("Your Browser Is Not Compatible")}


});




//}window.onload=init;
//Pagina 9 capitulo 3 para retornar la latitud longitud del marker
//overlay y latlng son variables ya definidas por google
//allow the user to click the map to create a marker

