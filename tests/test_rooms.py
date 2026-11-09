import unittest
import app as server


class RoomTests(unittest.TestCase):
    def setUp(self):
        server.action_history.clear()
        server.sid_room.clear()
        server.room_members.clear()
        self.clients = [server.socketio.test_client(server.app) for _ in range(3)]

    def tearDown(self):
        for client in self.clients:
            client.disconnect()

    def join(self, client, room):
        return client.emit('join_room', {'room': room, 'name': 'test'}, callback=True)

    def draw(self, client, room, stroke):
        client.emit('draw_line', dict(room=room, type='draw_line', strokeId=stroke,
                    color='#111827', size=8, erasing=False,
                    **{'from': {'x': .1, 'y': .1}, 'to': {'x': .2, 'y': .2}}))

    def test_membership_and_room_switch(self):
        a, b, outsider = self.clients
        self.join(a, 'one')
        self.join(b, 'one')
        self.draw(outsider, 'one', 'forged')
        self.assertEqual(server.action_history['one'], [])
        self.join(a, 'two')
        a.get_received()
        self.draw(b, 'one', 'old-room')
        self.assertFalse(any(e['name'] == 'draw_line' for e in a.get_received()))
        a.emit('clear_canvas', {'room': 'one'})
        self.assertEqual(len(server.action_history['one']), 1)

    def test_whole_stroke_undo_and_restore_clear(self):
        a, b, _ = self.clients
        self.join(a, 'shared')
        self.join(b, 'shared')
        self.draw(a, 'shared', 'a')
        self.draw(a, 'shared', 'a')
        self.draw(b, 'shared', 'b')
        a.emit('undo', {'room': 'shared'})
        self.assertEqual([x['strokeId'] for x in server.action_history['shared']], ['b'])
        a.emit('clear_canvas', {'room': 'shared'})
        self.draw(b, 'shared', 'c')
        a.emit('undo', {'room': 'shared'})
        self.assertEqual([x['strokeId'] for x in server.action_history['shared']], ['b', 'c'])

    def test_limit_clear_and_empty_room_cleanup(self):
        a, _, _ = self.clients
        self.join(a, 'bounded')
        self.draw(a, 'bounded', 'a')
        entry = server.action_history['bounded'][0]
        server.action_history['bounded'] = [entry] * server.MAX_ACTIONS
        self.draw(a, 'bounded', 'extra')
        self.assertEqual(len(server.action_history['bounded']), server.MAX_ACTIONS)
        a.emit('clear_canvas', {'room': 'bounded'})
        self.draw(a, 'bounded', 'new')
        self.assertEqual(len(server.action_history['bounded']), 2)
        a.emit('leave_room', {})
        self.assertNotIn('bounded', server.action_history)

    def test_reject_remote_image_sources(self):
        with self.assertRaises(ValueError):
            server._read_image_source('http://127.0.0.1/private')


if __name__ == '__main__':
    unittest.main()
