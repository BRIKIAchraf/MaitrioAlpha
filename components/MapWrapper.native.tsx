import MapView, * as MapStuff from 'react-native-maps';
import React from 'react';

export const Marker = MapStuff.Marker;
export const Polyline = MapStuff.Polyline;
export const PROVIDER_GOOGLE = MapStuff.PROVIDER_GOOGLE;

export default React.forwardRef((props: any, ref: any) => {
    return <MapView ref={ref} {...props} />;
});
