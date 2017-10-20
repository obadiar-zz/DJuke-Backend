var play = require('./backend/utils/SpotifyUtils.js').playSong
var token = "BQCUxY_HaQyiK0nSBM1UHO6qe27_Y9Sf-MJTGOMNHC8pGdls1x4WPPhctdgHWpGjHagOzPSLQk0-iVwXBM88c2s7rXlwLv9xLllnNJWCOvze3JjYwtqYYQBTtJGU2jJsTibGCgVBY1Mdf5oAJrZ3dPMuUshGH0YvgCN_7xtbAYLO-0NQTRq50_vsxsFBCJMQ8TOQHt0ARCuTh8m1x8E-JQzsUtWiCkDy7v1Fc-sg1zG4EOnF-1pRNg8KvusfgOkSYcJ4LyyGbPibukNV7oJqhgI41aclgrUW-R32eVUb7OdsShPyXLU1WWjJIt7xqAeUrM861r0"

var token = "Bearer " + token;
play(token);
