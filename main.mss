#main {
    marker-fill: #CCF;
    marker-width: 5;
    marker-line-color: #009;
    marker-line-opacity: 0.5;
    marker-line-width: 1;

    [count >= 2] {
        marker-fill: #00F;
    }

    [zoom = 5] {
        marker-width: 10;
    }
}
