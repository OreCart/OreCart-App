# from datetime import datetime, timedelta, timezone
# from unittest.mock import MagicMock

# import pytest
# from src.handlers.stops import StopModel, create_stop, get_stop, get_stops, update_stop
# from src.model.alert import Alert
# from src.model.route import Route
# from src.model.route_stop import RouteStop
# from src.model.stop import Stop
# from src.model.stop_disable import StopDisable


# @pytest.fixture
# def mock_stop():
#     return Stop(
#         id=1,
#         name="Stop 1",
#         lat=52.5200,
#         lon=13.4050,
#         active=True,
#     )


# @pytest.fixture
# def mock_stops():
#     return [
#         Stop(
#             id=1,
#             name="Stop 1",
#             lat=52.5200,
#             lon=13.4050,
#             active=True,
#         ),
#         Stop(
#             id=2,
#             name="Stop 2",
#             lat=48.8566,
#             lon=2.3522,
#             active=False,
#         ),
#         Stop(
#             id=3,
#             name="Stop 3",
#             lat=51.5074,
#             lon=0.1278,
#             active=True,
#         ),
#     ]


# @pytest.fixture
# def mock_routes():
#     return [
#         Route(id=1, name="Route 1", color="#000000"),
#         Route(id=2, name="Route 2", color="#000000"),
#     ]


# @pytest.fixture
# def mock_route_stops():
#     return [
#         RouteStop(id=1, route_id=1, stop_id=1, position=0),
#         RouteStop(id=2, route_id=2, stop_id=2, position=0),
#         RouteStop(id=3, route_id=1, stop_id=2, position=1),
#         RouteStop(id=4, route_id=1, stop_id=3, position=2),
#     ]


# @pytest.fixture
# def mock_alert():
#     return Alert(
#         id=1,
#         text="Alert 1",
#         start_datetime=datetime.now(timezone.utc),
#         end_datetime=datetime.now(timezone.utc) + timedelta(minutes=1),
#     )


# @pytest.fixture
# def mock_stop_disables():
#     return [StopDisable(id=1, stop_id=3, alert_id=1)]


# def test_get_stops_no_includes(mock_route_args, mock_stops):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.commit()

#     # Act
#     response = get_stops(mock_route_args.req)

#     # Assert
#     assert response == [
#         {
#             "id": mock_stop.id,
#             "name": mock_stop.name,
#             "latitude": mock_stop.lat,
#             "longitude": mock_stop.lon,
#         }
#         for mock_stop in mock_stops
#     ]


# def test_get_stops_include_routeIds(
#     mock_route_args, mock_stops, mock_routes, mock_route_stops
# ):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.add_all(mock_routes)
#     mock_route_args.session.add_all(mock_route_stops)
#     mock_route_args.session.commit()

#     mock_stop_route_ids = {1: [1], 2: [2, 1], 3: [1]}

#     # Act
#     response = get_stops(mock_route_args.req, ["routeIds"])

#     # Assert
#     assert response == [
#         {
#             "id": mock_stop.id,
#             "name": mock_stop.name,
#             "latitude": mock_stop.lat,
#             "longitude": mock_stop.lon,
#             "routeIds": mock_stop_route_ids[mock_stop.id],
#         }
#         for mock_stop in mock_stops
#     ]


# def test_get_stops_include_is_active_no_alert(mock_route_args, mock_stops):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.commit()

#     mock_stop_is_active = {1: True, 2: False, 3: True}

#     # Act
#     response = get_stops(mock_route_args.req, ["isActive"])

#     # Assert
#     assert response == [
#         {
#             "id": mock_stop.id,
#             "name": mock_stop.name,
#             "latitude": mock_stop.lat,
#             "longitude": mock_stop.lon,
#             "isActive": mock_stop_is_active[mock_stop.id],
#         }
#         for mock_stop in mock_stops
#     ]


# def test_get_stops_include_is_active_with_alert(
#     mock_route_args, mock_stops, mock_alert
# ):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.add(mock_alert)
#     mock_route_args.session.commit()

#     mock_stop_is_active = {1: True, 2: False, 3: True}

#     # Act
#     response = get_stops(mock_route_args.req, ["isActive"])

#     # Assert
#     assert response == [
#         {
#             "id": mock_stop.id,
#             "name": mock_stop.name,
#             "latitude": mock_stop.lat,
#             "longitude": mock_stop.lon,
#             "isActive": mock_stop_is_active[mock_stop.id],
#         }
#         for mock_stop in mock_stops
#     ]


# def test_get_stops_include_is_active_with_alert_and_disable(
#     mock_route_args, mock_stops, mock_alert, mock_stop_disables
# ):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.add(mock_alert)
#     mock_route_args.session.add_all(mock_stop_disables)
#     mock_route_args.session.commit()

#     mock_stop_is_active = {1: True, 2: False, 3: False}

#     # Act
#     response = get_stops(mock_route_args.req, ["isActive"])

#     # Assert
#     assert response == [
#         {
#             "id": mock_stop.id,
#             "name": mock_stop.name,
#             "latitude": mock_stop.lat,
#             "longitude": mock_stop.lon,
#             "isActive": mock_stop_is_active[mock_stop.id],
#         }
#         for mock_stop in mock_stops
#     ]


# def test_get_stops_include_route_ids_and_is_active(
#     mock_route_args,
#     mock_stops,
#     mock_routes,
#     mock_route_stops,
#     mock_alert,
#     mock_stop_disables,
# ):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.add_all(mock_routes)
#     mock_route_args.session.add_all(mock_route_stops)
#     mock_route_args.session.add(mock_alert)
#     mock_route_args.session.add_all(mock_stop_disables)
#     mock_route_args.session.commit()

#     mock_stop_route_ids = {1: [1], 2: [2, 1], 3: [1]}

#     mock_stop_is_active = {1: True, 2: False, 3: False}

#     # Act
#     response = get_stops(mock_route_args.req, ["routeIds", "isActive"])

#     # Assert
#     assert response == [
#         {
#             "id": mock_stop.id,
#             "name": mock_stop.name,
#             "latitude": mock_stop.lat,
#             "longitude": mock_stop.lon,
#             "routeIds": mock_stop_route_ids[mock_stop.id],
#             "isActive": mock_stop_is_active[mock_stop.id],
#         }
#         for mock_stop in mock_stops
#     ]


# def test_get_stop_no_includes(mock_route_args, mock_stops):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.commit()

#     mock_stop = mock_stops[0]

#     # Act
#     response = get_stop(mock_route_args.req, 1)

#     # Assert
#     assert response == {
#         "id": 1,
#         "name": "Stop 1",
#         "latitude": 52.5200,
#         "longitude": 13.4050,
#     }


# def test_get_stop_include_is_active_and_active(mock_route_args, mock_stops):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.commit()

#     mock_stop = mock_stops[0]

#     # Act
#     response = get_stop(mock_route_args.req, 1, ["isActive"])

#     # Assert
#     assert response == {
#         "id": 1,
#         "name": "Stop 1",
#         "latitude": 52.5200,
#         "longitude": 13.4050,
#         "isActive": True,
#     }


# def test_get_stop_include_is_active_and_inactive(mock_route_args, mock_stops):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.commit()

#     # Act
#     response = get_stop(mock_route_args.req, 2, ["isActive"])

#     # Assert
#     assert response == {
#         "id": 2,
#         "name": "Stop 2",
#         "latitude": 48.8566,
#         "longitude": 2.3522,
#         "isActive": False,
#     }


# def test_get_stop_include_is_active_with_alert(mock_route_args, mock_stops, mock_alert):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.add(mock_alert)
#     mock_route_args.session.commit()

#     mock_stop = mock_stops[2]

#     # Act
#     response = get_stop(mock_route_args.req, 3, ["isActive"])

#     # Assert
#     assert response == {
#         "id": 3,
#         "name": "Stop 3",
#         "latitude": 51.5074,
#         "longitude": 0.1278,
#         "isActive": True,
#     }


# def test_get_stop_include_is_active_with_alert_and_disables(
#     mock_route_args, mock_stops, mock_alert, mock_stop_disables
# ):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.add(mock_alert)
#     mock_route_args.session.add_all(mock_stop_disables)
#     mock_route_args.session.commit()

#     # Act
#     response = get_stop(mock_route_args.req, 3, ["isActive"])

#     # Assert
#     assert response == {
#         "id": 3,
#         "name": "Stop 3",
#         "latitude": 51.5074,
#         "longitude": 0.1278,
#         "isActive": False,
#     }


# def test_get_stop_with_route_ids(
#     mock_route_args, mock_stops, mock_routes, mock_route_stops
# ):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.add_all(mock_routes)
#     mock_route_args.session.add_all(mock_route_stops)
#     mock_route_args.session.commit()

#     # Act
#     response = get_stop(mock_route_args.req, 2, ["routeIds"])

#     # Assert
#     assert response == {
#         "id": 2,
#         "name": "Stop 2",
#         "latitude": 48.8566,
#         "longitude": 2.3522,
#         "routeIds": [2, 1],
#     }


# def test_get_stop_with_routeIds_and_isActive(
#     mock_route_args,
#     mock_stops,
#     mock_routes,
#     mock_route_stops,
#     mock_alert,
#     mock_stop_disables,
# ):
#     mock_route_args.session.add_all(mock_stops)
#     mock_route_args.session.add_all(mock_routes)
#     mock_route_args.session.add_all(mock_route_stops)
#     mock_route_args.session.add(mock_alert)
#     mock_route_args.session.add_all(mock_stop_disables)
#     mock_route_args.session.commit()

#     # Act
#     response = get_stop(mock_route_args.req, 3, ["routeIds", "isActive"])

#     # Assert
#     assert response == {
#         "id": 3,
#         "name": "Stop 3",
#         "latitude": 51.5074,
#         "longitude": 0.1278,
#         "routeIds": [1],
#         "isActive": False,
#     }


# def test_create_stop(mock_route_args, mock_stop):
#     # Arrange
#     stop_model = StopModel(
#         name=mock_stop.name,
#         latitude=mock_stop.lat,
#         longitude=mock_stop.lon,
#         active=mock_stop.active,
#     )

#     # Act
#     response = create_stop(mock_route_args.req, stop_model)

#     # Assert
#     assert response == {"message": "OK"}
#     assert (
#         mock_route_args.session.query(Stop).filter_by(id=mock_stop.id).first()
#         == mock_stop
#     )


# def test_update_stop(mock_route_args, mock_stop):
#     # Arrange
#     mock_route_args.session.add(mock_stop)
#     new_mock_stop = Stop(
#         id=mock_stop.id,
#         name=mock_stop.name + " (updated)",
#         lat=mock_stop.lat + 1,
#         lon=mock_stop.lon + 1,
#         active=not mock_stop.active,
#     )
#     new_stop_model = StopModel(
#         name=new_mock_stop.name,
#         latitude=new_mock_stop.lat,
#         longitude=new_mock_stop.lon,
#         active=new_mock_stop.active,
#     )

#     # Act
#     response = update_stop(mock_route_args.req, mock_stop.id, new_stop_model)

#     # Assert
#     assert response == {"message": "OK"}
#     assert (
#         mock_route_args.session.query(Stop).filter_by(id=new_mock_stop.id).first()
#         == new_mock_stop
#     )
