document.addEventListener("DOMContentLoaded", function () {
    const calculateButton = document.getElementById("calculate");

    calculateButton.addEventListener("click", function () {
      const hA = parseFloat(document.getElementById("size-ha").value) || 0;
      const region = document.getElementById("region").value;
      const cows = parseFloat(document.getElementById("cows").value) || 0;
      const feed = document.getElementById("feed").value;
      const soil = document.getElementById("soil").value;
      const waterTable = document.getElementById("hummidity").value;
      const landUse = document.getElementById("land").value;
      const housingPercentage = parseFloat(document.getElementById("housing").value) || 0;
      const grazingPercentage = parseFloat(document.getElementById("grazing").value) || 0;

      // SHOW  ARROWS, LINES, AND CLOUDS ANIMATION
      document.querySelectorAll(".arrow1, .arrow2, .arrow3, .arrow4, .arrow5, .arrow6, .arrow7, .arrow8, .arrow9, .arrow10, .line1, .line2, .vl, .cloud-n2, .cloud-sf, .cloud-di, .cloud-nh3, .cloud-no3, .cloud-ns, .cloud-total, .cloud-nh4").forEach(element => {
          element.style.display = "block";
      });
  

      // PERCENTAGES -> DECIMAL
      const housing = housingPercentage / 100;
      const grazing = grazingPercentage / 100;

      // NITROGEN PER COW PER DAY BASED ON FEED
      let nCowDay = 0;
      
      if (feed === "corn") {
        nCowDay = 0.279;
      } else if (feed === "grass") {
        nCowDay = 0.406;
      } else if (feed === "corngrass") {
        nCowDay = 0.345;
      }
      
      // FRACTION OF AMMONIA GRAZING BASED ON SOIL AND LAND
      let frAmGrazing = 0;
      
      if (landUse === "grassland") {
        if (soil === "sand") {
          frAmGrazing = 0.05;
        } else if (soil === "clay") {
          frAmGrazing = 0.10;
        }
      } else if (landUse === "maize" || landUse === "arable") {
        frAmGrazing = 0.10;
      }
      
      // FRACTION OF UPTAKE BASED ON SOIL, LAND, AND WATER TABLE
      let frUp = 0;
      
      if (soil === "sand") {
          if (waterTable === "dry") {
              if (landUse === "grassland") frUp = 0.50;
              else if (landUse === "maize") frUp = 0.38;
              else if (landUse === "arable") frUp = 0.28;
          } else if (waterTable === "moist") {
              if (landUse === "grassland") frUp = 0.38;
              else if (landUse === "maize") frUp = 0.33;
              else if (landUse === "arable") frUp = 0.25;
          } else if (waterTable === "wet") {
              if (landUse === "grassland") frUp = 0.36;
              else if (landUse === "maize") frUp = 0.33;
              else if (landUse === "arable") frUp = 0.25;
          }
      } else if (soil === "loess" || soil === "clay") {
          if (waterTable === "dry") {
              if (landUse === "grassland") frUp = 0.38;
              else if (landUse === "maize") frUp = 0.42;
              else if (landUse === "arable") frUp = 0.33;
          } else if (waterTable === "moist" || waterTable === "wet") {
              if (landUse === "grassland") frUp = 0.36;
              else if (landUse === "maize") frUp = 0.42;
              else if (landUse === "arable") frUp = 0.33;
          }
      } else if (soil === "peat") {
          if (waterTable === "dry" || waterTable === "moist") {
              if (landUse === "grassland") frUp = 0.27;
              else if (landUse === "maize") frUp = 0.33;
              else if (landUse === "arable") frUp = 0.25;
          } else if (waterTable === "wet") {
              if (landUse === "grassland") frUp = 0.36;
              else if (landUse === "maize") frUp = 0.48;
              else if (landUse === "arable") frUp = 0.32;
          }
      }
      
      // MAXIMUM N UPTAKE BASED ON SOIL, LAND, AND WATER TABLE
      let maxUp = 0;
      
      if (soil === "sand") {
          if (waterTable === "dry") {
              if (landUse === "grassland") maxUp = 240;
              else if (landUse === "maize") maxUp = 155;
              else if (landUse === "arable") maxUp = 110;
          } else if (waterTable === "moist") {
              if (landUse === "grassland") maxUp = 290;
              else if (landUse === "maize") maxUp = 180;
              else if (landUse === "arable") maxUp = 135;
          } else if (waterTable === "wet") {
              if (landUse === "grassland") maxUp = 255;
              else if (landUse === "maize") maxUp = 145;
              else if (landUse === "arable") maxUp = 110;
          }
      } else if (soil === "loess" || soil === "clay") {
          if (waterTable === "dry") {
              if (landUse === "grassland") maxUp = 340;
              else if (landUse === "maize") maxUp = 195;
              else if (landUse === "arable") maxUp = 160;
          } else if (waterTable === "moist" || waterTable === "wet") {
              if (landUse === "grassland") maxUp = 270;
              else if (landUse === "maize") maxUp = 195;
              else if (landUse === "arable") maxUp = 160;
          }
      } else if (soil === "peat") {
          if (waterTable === "dry" || waterTable === "moist") {
              if (landUse === "grassland") maxUp = 340;
              else if (landUse === "maize") maxUp = 180;
              else if (landUse === "arable") maxUp = 135;
          } else if (waterTable === "wet") {
              if (landUse === "grassland") maxUp = 270;
              else if (landUse === "maize") maxUp = 145;
              else if (landUse === "arable") maxUp = 110;
          }
      }
      
      // FRACTION OF MAXIMUM N UPTAKE AT ZERO INPUT BASED ON SOIL, LAND, AND WATER TABLE
      let fractionMax = 0;
      
      if (soil === "sand") {
          if (waterTable === "dry") {
              if (landUse === "grassland") fractionMax = 0.45; 
              else if (landUse === "maize") fractionMax = 0.53;
              else if (landUse === "arable") fractionMax = 0.80;
          } else if (waterTable === "moist") {
              if (landUse === "grassland") fractionMax = 0.51;
              else if (landUse === "maize") fractionMax = 0.57;
              else if (landUse === "arable") fractionMax = 0.80;
          } else if (waterTable === "wet") {
              if (landUse === "grassland") fractionMax = 0.50;
              else if (landUse === "maize") fractionMax = 0.53;
              else if (landUse === "arable") fractionMax = 0.80;
          }
      } else if (soil === "loess" || soil === "clay") {
          if (waterTable === "dry") {
              if (landUse === "grassland") fractionMax = 0.43;
              else if (landUse === "maize") fractionMax = 0.53;
              else if (landUse === "arable") fractionMax = 0.67;
          } else if (waterTable === "moist" || waterTable === "wet") {
              if (landUse === "grassland") fractionMax = 0.43;
              else if (landUse === "maize") fractionMax = 0.53;
              else if (landUse === "arable") fractionMax = 0.67;
          }
      } else if (soil === "peat") {
          if (waterTable === "dry" || waterTable === "moist") {
              if (landUse === "grassland") fractionMax = 0.77;
              else if (landUse === "maize") fractionMax = 0.71;
              else if (landUse === "arable") fractionMax = 0.80;
          } else if (waterTable === "wet") {
              if (landUse === "grassland") fractionMax = 0.62;
              else if (landUse === "maize") fractionMax = 0.46;
              else if (landUse === "arable") fractionMax = 0.64;
          }
      }
      
      // FRACTION OF NITRIFICATION BASED ON SOIL, LAND, AND WATER TABLE
      let frNi = 0;

        if (soil === "sand") {
            if (waterTable === "dry") {
                if (landUse === "grassland") {
                    frNi = (0.98 + 1.00) / 2;
                } else if (landUse === "maize") {
                    frNi = (0.98 + 1.00) / 2;
                } else if (landUse === "arable") {
                    frNi = (1.00 + 1.00) / 2;
                }
            } else if (waterTable === "moist") {
                if (landUse === "grassland") {
                    frNi = (0.95 + 1.00) / 2;
                } else if (landUse === "maize") {
                    frNi = (0.95 + 1.00) / 2;
                } else if (landUse === "arable") {
                    frNi = (1.00 + 1.00) / 2;
                }
            } else if (waterTable === "wet") {
                if (landUse === "grassland") {
                    frNi = (0.90 + 0.95) / 2;
                } else if (landUse === "maize") {
                    frNi = (0.90 + 0.95) / 2;
                } else if (landUse === "arable") {
                    frNi = (0.95 + 0.95) / 2;
                }
            }
        } else if (soil === "loess" || soil === "clay") {
            if (waterTable === "dry") {
                if (landUse === "grassland") {
                    frNi = (0.98 + 1.00) / 2;
                } else if (landUse === "maize") {
                    frNi = (0.98 + 1.00) / 2;
                } else if (landUse === "arable") {
                    frNi = (1.00 + 1.00) / 2;
                }
            } else if (waterTable === "moist" || waterTable === "wet") {
                if (landUse === "grassland") {
                    frNi = (0.95 + 1.00) / 2;
                } else if (landUse === "maize") {
                    frNi = (0.95 + 1.00) / 2;
                } else if (landUse === "arable") {
                    frNi = (1.00 + 1.00) / 2;
                }
            }
        } else if (soil === "peat") {
            if (waterTable === "dry" || waterTable === "moist") {
                if (landUse === "grassland") {
                    frNi = (0.90 + 1.00) / 2;
                } else if (landUse === "maize") {
                    frNi = (0.90 + 1.00) / 2;
                } else if (landUse === "arable") {
                    frNi = (1.00 + 1.00) / 2;
                }
            } else if (waterTable === "wet") {
                if (landUse === "grassland") {
                    frNi = (0.80 + 0.90) / 2;
                } else if (landUse === "maize") {
                    frNi = (0.80 + 0.90) / 2;
                } else if (landUse === "arable") {
                    frNi = (0.90 + 0.95) / 2;
                }
            }
        }

        // FRACTION OF DENITRIFICATION BASED ON SOIL, LAND, AND WATER TABLE
        let frDe = 0;

        if (soil === "sand") {
            if (waterTable === "dry") {
                if (landUse === "grassland") {
                    frDe = (0.30 + 0.60) / 2;
                } else if (landUse === "maize") {
                    frDe = (0.20 + 0.50) / 2;
                } else if (landUse === "arable") {
                    frDe = (0.60 + 0.50) / 2;
                }
            } else if (waterTable === "moist") {
                if (landUse === "grassland") {
                    frDe = (0.40 + 0.80) / 2;
                } else if (landUse === "maize") {
                    frDe = (0.30 + 0.70) / 2;
                } else if (landUse === "arable") {
                    frDe = (0.80 + 0.70) / 2;
                }
            } else if (waterTable === "wet") {
                if (landUse === "grassland") {
                    frDe = (0.60 + 0.95) / 2;
                } else if (landUse === "maize") {
                    frDe = (0.50 + 0.90) / 2;
                } else if (landUse === "arable") {
                    frDe = (0.95 + 0.95) / 2;
                }
            }
        } else if (soil === "loess" || soil === "clay") {
            if (waterTable === "dry") {
                if (landUse === "grassland") {
                    frDe = (0.50 + 0.70) / 2;
                } else if (landUse === "maize") {
                    frDe = (0.30 + 0.60) / 2;
                } else if (landUse === "arable") {
                    frDe = (0.60 + 0.85) / 2;
                }
            } else if (waterTable === "moist" || waterTable === "wet") {
                if (landUse === "grassland") {
                    frDe = (0.60 + 0.85) / 2;
                } else if (landUse === "maize") {
                    frDe = (0.40 + 0.80) / 2;
                } else if (landUse === "arable") {
                    frDe = (0.70 + 0.90) / 2;
                }
            }
        } else if (soil === "peat") {
            if (waterTable === "dry" || waterTable === "moist") {
                if (landUse === "grassland") {
                    frDe = (0.80 + 0.95) / 2;
                } else if (landUse === "maize") {
                    frDe = (0.60 + 0.90) / 2;
                } else if (landUse === "arable") {
                    frDe = (0.80 + 0.95) / 2;
                }
            } else if (waterTable === "wet") {
                if (landUse === "grassland") {
                    frDe = (0.90 + 0.98) / 2;
                } else if (landUse === "maize") {
                    frDe = (0.80 + 1.00) / 2;
                } else if (landUse === "arable") {
                    frDe = (0.90 + 0.98) / 2;
                }
            }
       }
        // " FOR DITCHES
        let frDeDitches = 0;

        if (soil === "sand") {
            if (waterTable === "dry") {
                frDeDitches = (0.00 + 0.80) / 2;  // Average of 0.00 and 0.80
            } else if (waterTable === "moist") {
                frDeDitches = (0.10 + 0.90) / 2;  // Average of 0.10 and 0.90
            } else if (waterTable === "wet") {
                frDeDitches = (0.50 + 0.95) / 2;  // Average of 0.50 and 0.95
            }
        }
        else if (soil === "loess") {
            if (waterTable === "dry") {
                frDeDitches = (0.10 + 0.85) / 2;  // Average of 0.10 and 0.85
            } else if (waterTable === "moist") {
                frDeDitches = (0.30 + 0.90) / 2;  // Average of 0.30 and 0.90
            } else if (waterTable === "wet") {
                frDeDitches = (0.50 + 0.95) / 2;  // Average of 0.50 and 0.95
            }
        }
        else if (soil === "clay") {
            if (waterTable === "dry") {
                frDeDitches = (0.30 + 0.90) / 2;  // Average of 0.30 and 0.90
            } else if (waterTable === "moist") {
                frDeDitches = (0.50 + 0.95) / 2;  // Average of 0.50 and 0.95
            } else if (waterTable === "wet") {
                frDeDitches = (0.80 + 0.95) / 2;  // Average of 0.80 and 0.95
            }
        }
        else if (soil === "peat") {
            if (waterTable === "dry") {
                frDeDitches = (0.80 + 0.95) / 2;  // Average of 0.80 and 0.95
            } else if (waterTable === "moist") {
                frDeDitches = (0.80 + 0.95) / 2;  // Average of 0.80 and 0.95
            } else if (waterTable === "wet") {
                frDeDitches = (0.90 + 0.98) / 2;  // Average of 0.90 and 0.98
            }
        }

        // FRACTION OF RUNOFF BASED ON SOIL AND WATER TABLE
        let frRo = 0;

        if (soil === "sand" || soil === "loess") {
            if (waterTable === "dry") {
                frRo = (0.0 + 0.1) / 2; 
            } else if (waterTable === "moist") {
                frRo = (0.3 + 0.7) / 2;
            } else if (waterTable === "wet") {
                frRo = (0.8 + 1.0) / 2;
            }
        } else if (soil === "clay") {
            if (waterTable === "dry") {
                frRo = (0.0 + 0.2) / 2; 
            } else if (waterTable === "moist") {
                frRo = (0.3 + 0.7) / 2;
            } else if (waterTable === "wet") {
                frRo = (0.9 + 1.0) / 2;
            }
        } else if (soil === "peat") {
            if (waterTable === "dry") {
                frRo = (0.1 + 0.34) / 2;
            } else if (waterTable === "moist") {
                frRo = (0.3 + 0.7) / 2;
            } else if (waterTable === "wet") {
                frRo = (0.9 + 1.0) / 2;
            }
        }
     
        // FRACTION OF RETENTION BASED ON SOIL, LAND, AND WATER TABLE
        let frRet = 0;

        if (region === "ijssel") {
            frRet = (0.2 + 0.4) / 2;
        }
        else if (region === "isselmeer") {
            frRet = (0.4 + 0.6) / 2;
        }
        else if (region === "maas") {
            frRet = (0.2 + 0.4) / 2;
        }
        else if (region === "central") {
            frRet = (0.3 + 0.7) / 2;
        }
        else if (region === "south-delta") {
            frRet = (0.1 + 0.2) / 2;
        }

      // FORMULAS
      // NITROGEN UPTAKE MINIMUM
      const nitrogenUpMin = maxUp * fractionMax * hA
      
      // NITROGEN EMISSIONS 
      // HOUSING
      const nitrogenHousing = nCowDay * 365 * housing * cows;
      
      // GRAZING
      const nitrogenGrazing = nCowDay * 365 * grazing * cows;
      
      const nitrogenEm = nitrogenHousing + nitrogenGrazing
      
      // AMMONIA EMISSIONS 
      // HOUSING
      const ammoniaHousing = 0.13 * nitrogenHousing
      
      // GRAZING
      const ammoniaGrazing = frAmGrazing * nitrogenGrazing
      
      const ammoniaEm = ammoniaHousing + ammoniaGrazing
      
      // NITROGEN UPTAKE
      const nitrogenUp = nitrogenUpMin + frUp * (nitrogenEm - ammoniaEm)
      
      // NITRIFRICATION IN THE SOIL
      const nitrification = frNi * (nitrogenEm - ammoniaEm - nitrogenUp)

      // DENITRIFICATION IN THE SOIL
      const denitrification = frDe * nitrification
      
      // NH4 EXCESS
      const nh4Ex = nitrogenEm - ammoniaEm - nitrogenUp - nitrification
      
      // NH4 LEACHING TO GROUNDWATER
      const nh4Le = (1 - frRo) * nh4Ex      
      
      // NO3 LEACHING TO GROUNDWATER
      const no3Ex = nitrification - denitrification
      const no3Le = (1 - frRo) * no3Ex   

      // NITROGEN EXCESS
      const excess = nitrogenEm - ammoniaEm - nitrogenUp - denitrification

      // RUNOFF TO DITCHES 
      const roDitch = frRo * excess

      // RUNOFF TO SURFACE WATER 
      const roSw = (1 - frDeDitches) * roDitch

      // RETENTION
      const ret = frRet * roSw

      // RUNOFF TO SEA
      const roSea = (1 - frRet) * roSw
    
    // OUTPUT
    document.getElementById("nitrogen-housing").textContent = `Total nitrogen emission from housing: ${nitrogenHousing.toFixed(2)} kg/year`;
    document.getElementById("nitrogen-grazing").textContent = `Total nitrogen emission from grazing: ${nitrogenGrazing.toFixed(2)} kg/year`;
    document.getElementById("ammonia-housing").textContent = `Total ammonia emission from housing: ${ammoniaHousing.toFixed(2)} kg/year`;
    document.getElementById("ammonia-grazing").textContent = `Total ammonia emission from grazing: ${ammoniaGrazing.toFixed(2)} kg/year`;
    document.getElementById("nitrification").textContent = `Nitrification: ${nitrification.toFixed(2)} kg/year`;
    document.getElementById("denitrification").textContent = `Denitrification: ${denitrification.toFixed(2)} kg/year`;
    document.getElementById("uptake").textContent = `Uptake: ${nitrogenUp.toFixed(2)} kg/year`;
    document.getElementById("nh4-gw").textContent = `Total NH4 leaching to groundwater: ${nh4Le.toFixed(2)} kg/year`;
    document.getElementById("no3-gw").textContent = `Total NO3 leaching to groundwater: ${no3Le.toFixed(2)} kg/year`;
    document.getElementById("ro-ditch").textContent = `Total nitrogen runoff to ditches: ${roDitch.toFixed(2)} kg/year`;
    document.getElementById("ro-sw").textContent = `Total nitrogen runoff to surface water: ${roSw.toFixed(2)} kg/year`;
    document.getElementById("retention").textContent = `Retention: ${ret.toFixed(2)} kg/year`;
    document.getElementById("ro-sea").textContent = `Total nitrogen runoff to sea: ${roSea.toFixed(2)} kg/year`;

    document.querySelector(".cloud-nh3").innerHTML = `NH3: <br> ${ammoniaEm.toFixed(2)} kg/year`;
    document.querySelector(".cloud-ns").innerHTML = `N2, NO2, N2O: <br> ${denitrification.toFixed(2)} kg/year`;
    document.querySelector(".cloud-total").innerHTML = `Total N in soil: <br> ${excess.toFixed(2)} kg/year`;
    document.querySelector(".cloud-nh4").innerHTML = `NH4 leach to ground water: <br> ${nh4Le.toFixed(2)} kg/year`;
    document.querySelector(".cloud-no3").innerHTML = `NO3 leach to ground water: <br> ${no3Le.toFixed(2)} kg/year`;
    document.querySelector(".cloud-di").innerHTML = `N runoff to ditches: <br> ${roDitch.toFixed(2)} kg/year`;
    document.querySelector(".cloud-sf").innerHTML = `N runoff to surface: <br> ${roSw.toFixed(2)} kg/year`;
    document.querySelector(".cloud-n2").innerHTML = `N2: <br> ${roSea.toFixed(2)} kg/year`;
    });
  });

  function toggleInfo(id) {
    const info = document.getElementById(id);
    info.classList.toggle("hidden");
}

app.get('/how-it-works', (req, res) => {
  res.sendFile(__dirname + '/wscoreinfo.html');
});