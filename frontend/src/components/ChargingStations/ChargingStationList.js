import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  AppBar,
  Toolbar,
  Divider,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterIcon, Logout as LogoutIcon, Add as AddIcon } from '@mui/icons-material';
import { getAllStations, createStation, updateStation, deleteStation } from '../../services/chargingStationApi';
import { useNavigate } from 'react-router-dom';
import ChargingStationMap from './ChargingStationMap';

const ChargingStationList = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    connectorType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: {
      latitude: '',
      longitude: '',
    },
    status: 'Active',
    powerOutput: '',
    connectorType: '',
  });

  // Connector types list
  const connectorTypes = ['Type 1', 'Type 2', 'CHAdeMO', 'CCS', 'Tesla'];

  const fetchStations = async () => {
    try {
      setLoading(true);
      const data = await getAllStations(filters);
      console.log('Fetched stations:', data); // Debug log to see station data
      setStations(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [filters]);

  useEffect(() => {
    // Get the current user's ID from the JWT token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Current user ID:', payload.id); // Debug log
        setCurrentUser(payload.id);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedStation) {
        await updateStation(selectedStation._id, formData);
        setSuccess('Charging station updated successfully!');
      } else {
        await createStation(formData);
        setSuccess('Charging station created successfully!');
      }
      handleCloseDialog();
      fetchStations();
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You are not authorized to modify this station');
      } else {
        setError(err.message || 'Failed to save the station');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this charging station?')) {
      try {
        setLoading(true);
        await deleteStation(id);
        setSuccess('Charging station deleted successfully!');
        fetchStations();
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You are not authorized to delete this station');
        } else {
          setError(err.message || 'Failed to delete the station');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = (station = null) => {
    if (station) {
      setSelectedStation(station);
      setFormData({
        name: station.name,
        location: station.location,
        status: station.status,
        powerOutput: station.powerOutput,
        connectorType: station.connectorType,
      });
    } else {
      setSelectedStation(null);
      setFormData({
        name: '',
        location: {
          latitude: '',
          longitude: '',
        },
        status: 'Active',
        powerOutput: '',
        connectorType: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStation(null);
    setFormData({
      name: '',
      location: {
        latitude: '',
        longitude: '',
      },
      status: 'Active',
      powerOutput: '',
      connectorType: '',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 3 }}>
            EV Charging Station Dashboard
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <InputLabel sx={{ color: 'white' }}>Station Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Station Status"
                sx={{ 
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '.MuiSvgIcon-root': { color: 'white' }
                }}
              >
                <MenuItem value="">Show All Stations</MenuItem>
                <MenuItem value="Active">Active Stations</MenuItem>
                <MenuItem value="Inactive">Inactive Stations</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <InputLabel sx={{ color: 'white' }}>Charger Type</InputLabel>
              <Select
                name="connectorType"
                value={filters.connectorType}
                onChange={handleFilterChange}
                label="Charger Type"
                sx={{ 
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '.MuiSvgIcon-root': { color: 'white' }
                }}
              >
                <MenuItem value="">All Charger Types</MenuItem>
                <Box component="div" sx={{ px: 2, py: 1, typography: 'body2', color: 'text.secondary' }}>
                  Standard Types
                </Box>
                <MenuItem value="Type 1">Type 1 - SAE J1772</MenuItem>
                <MenuItem value="Type 2">Type 2 - Mennekes</MenuItem>
                <MenuItem value="CCS">CCS - Combined Charging</MenuItem>
                <Box component="div" sx={{ px: 2, py: 1, typography: 'body2', color: 'text.secondary' }}>
                  Fast Charging
                </Box>
                <MenuItem value="CHAdeMO">CHAdeMO</MenuItem>
                <MenuItem value="Tesla">Tesla Supercharger</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleOpenDialog()}
              startIcon={<AddIcon />}
              sx={{ 
                height: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'white',
                }
              }}
            >
              Add New Station
            </Button>
          </Box>

          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {stations.map((station) => (
            <Grid item xs={12} sm={6} md={4} key={station._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {station.name}
                  </Typography>
                  <Typography color="textSecondary" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: station.status === 'Active' ? 'success.main' : 'error.main'
                  }}>
                    • {station.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Location: {station.location.latitude}, {station.location.longitude}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Power Output: {station.powerOutput} kW
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Connector: {station.connectorType}
                  </Typography>
                  {station.isOwner && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(station)}
                        size="small"
                        title="Edit Station"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(station._id)}
                        size="small"
                        title="Delete Station"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Map View */}
        <ChargingStationMap stations={stations} />

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedStation ? 'Edit Charging Station' : 'Add New Charging Station'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="location.latitude"
                    type="number"
                    value={formData.location.latitude}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="location.longitude"
                    type="number"
                    value={formData.location.longitude}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                      required
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Power Output (kW)"
                    name="powerOutput"
                    type="number"
                    value={formData.powerOutput}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Connector Type</InputLabel>
                    <Select
                      name="connectorType"
                      value={formData.connectorType}
                      onChange={handleInputChange}
                      label="Connector Type"
                      required
                    >
                      <MenuItem value="Type 1">Type 1 - SAE J1772</MenuItem>
                      <MenuItem value="Type 2">Type 2 - Mennekes</MenuItem>
                      <MenuItem value="CCS">CCS - Combined Charging</MenuItem>
                      <MenuItem value="CHAdeMO">CHAdeMO</MenuItem>
                      <MenuItem value="Tesla">Tesla Supercharger</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading
                  ? 'Saving...'
                  : selectedStation
                  ? 'Update Station'
                  : 'Add Station'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </>
  );
};

export default ChargingStationList; 