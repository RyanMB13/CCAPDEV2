    $(document).ready(function() {

      $(".univs button").click(function() {
        var buttonId = $(this).attr("id");

        $(".events .post").hide();

        switch (buttonId) {
          case "btnALL":
            $(".title").css("background-color", "white");
            $(".events .post").show();
            break;
          case "btnADMU":
            $(".title").css("background-color", "#cce5ff");
            $(".events #postADMU").show();
            break;
          case "btnDLSU":
            $(".title").css("background-color", "#d4edda");
            $(".events #postDLSU").show();
            break;
          case "btnUP":
            $(".title").css("background-color", "#f8d7da");
            $(".events #postUP").show();
            break;
          case "btnUST":
            $(".title").css("background-color", "#fff3cd");
            $(".events #postUST").show();
            break;
          case "btnFEU":
            $(".title").css("background-color", "#bfbfbf");
            $(".events #postFEU").show();
            break;  
          default:
            $(".title").css("background-color", "white"); 
            $(".events .post").show();
        }
      });
    });

    function redirectToLink() {
      window.location.href = 'eventpage';
    }