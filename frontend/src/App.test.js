import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Nav from './Components/Nav';
import Renamer from './Components/Renamer';

test('renders Search nav link', () => {
  render(
    <BrowserRouter>
      <Nav />
    </BrowserRouter>
  );
  const searchElement = screen.getByText(/Search/i);
  expect(searchElement).toBeInTheDocument();
});

test('Renamer properly maps feature IDs to feature names without mutating inputs', () => {
  const parks = [
    {
      pid: 1,
      name: 'Test Park',
      fids: [10, 20]
    }
  ];
  const features = [
    { fid: 10, name: 'Play Area' },
    { fid: 20, name: 'Waterfront' }
  ];

  const renamed = Renamer(parks, features);
  expect(renamed[0].fids).toEqual(['Play Area', 'Waterfront']);
  expect(parks[0].fids).toEqual([10, 20]); // Immuntability preserved
});
