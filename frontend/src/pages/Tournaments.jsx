import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Crown, 
  ArrowLeft, 
  Home,
  X,
  Check,
  Trophy,
  Search,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  User,
  Play,
  Star,
  Clock,
  Medal,
  Eye,
  Filter,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import LocationInput from '../components/LocationInput';
import { 
  listTournaments,
  getTournament,
  createTournament,
  joinTournament,
  getTournamentEntries,
  approveEntry,
  rejectEntry,
  getTournamentMatches,
  getTournamentLeaderboard,
  generateFixtures
} from '../services/tournamentAPI';
import { getUserTeams } from '../services/teamAPI';
import { useAuth } from '../context/AuthContext';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameTypeFilter, setGameTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTournamentDetails, setShowTournamentDetails] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [entries, setEntries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [creatorFilter, setCreatorFilter] = useState(''); // 'my' | 'others' | ''

  const { user } = useAuth();
  const navigate = useNavigate();

  // Game types for filter dropdown
  const gameTypes = [
    'Football',
    'Basketball', 
    'Cricket',
    'Tennis',
    'Badminton',
    'Volleyball',
    'Table Tennis',
    'Hockey',
    'Kabaddi',
    'Baseball',
    'Other'
  ];
  const statuses = ['upcoming', 'ongoing', 'completed'];

  // Sport-based color theming
  const getSportColor = (gameType) => {
    const colors = {
      'Football': 'from-green-400 to-green-600',
      'Basketball': 'from-orange-400 to-orange-600',
      'Cricket': 'from-blue-400 to-blue-600',
      'Tennis': 'from-yellow-400 to-yellow-600',
      'Badminton': 'from-purple-400 to-purple-600',
      'Volleyball': 'from-red-400 to-red-600',
      'Table Tennis': 'from-pink-400 to-pink-600',
      'Hockey': 'from-indigo-400 to-indigo-600',
      'Kabaddi': 'from-amber-400 to-amber-600',
      'Baseball': 'from-gray-400 to-gray-600',
      'Other': 'from-teal-400 to-teal-600'
    };
    const normalizedType = gameType?.charAt(0).toUpperCase() + gameType?.slice(1).toLowerCase();
    return colors[normalizedType] || 'from-gray-100 to-gray-200';
  };

  const getSportBadgeColor = (gameType) => {
    const colors = {
      'Football': 'bg-green-100 text-green-800 border-green-200',
      'Basketball': 'bg-orange-100 text-orange-800 border-orange-200',
      'Cricket': 'bg-blue-100 text-blue-800 border-blue-200',
      'Tennis': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Badminton': 'bg-purple-100 text-purple-800 border-purple-200',
      'Volleyball': 'bg-red-100 text-red-800 border-red-200',
      'Table Tennis': 'bg-pink-100 text-pink-800 border-pink-200',
      'Hockey': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Kabaddi': 'bg-amber-100 text-amber-800 border-amber-200',
      'Baseball': 'bg-gray-100 text-gray-800 border-gray-200',
      'Other': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    const normalizedType = gameType?.charAt(0).toUpperCase() + gameType?.slice(1).toLowerCase();
    return colors[normalizedType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSportIcon = (gameType) => {
    // Return appropriate sport emoji/icon based on game type
    const icons = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Cricket': '🏏',
      'Tennis': '🎾',
      'Badminton': '🏸',
      'Volleyball': '🏐',
      'Table Tennis': '🏓',
      'Hockey': '🏒',
      'Kabaddi': '🤼',
      'Baseball': '⚾',
      'Other': '🏃'
    };
    const normalizedType = gameType?.charAt(0).toUpperCase() + gameType?.slice(1).toLowerCase();
    return icons[normalizedType] || '🏃';
  };

  // New tournament form state
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    gameType: 'football',
    participationType: 'team', // 'team', 'individual', or 'mixed'
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    minTeams: 2,
    maxTeams: 16,
    pointsPerWin: 3,
    pointsPerDraw: 1,
    autoGenerateOnMinReached: false,
    entryPolicy: {
      autoApprove: false,
      hostApprovalRequired: true
    },
    logistics: {
      venue: '',
      venueGeo: null
    },
    location: '',
    geoLocation: null,
    rules: '',
    ageLimit: 0,
    entryCriteria: {
      teamSizeLimit: {
        min: 0,
        max: 0
      }
    }
  });

  // Fetch tournaments and user teams
  useEffect(() => {
    if (user) {
      fetchTournaments();
      fetchUserTeams();
    }
  }, [user]);

  // Filter tournaments based on search and filters
  useEffect(() => {
    let filtered = tournaments;

    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tournament.description && tournament.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (gameTypeFilter) {
      filtered = filtered.filter(tournament => tournament.gameType === gameTypeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(tournament => tournament.status === statusFilter);
    }

    if (creatorFilter) {
      if (creatorFilter === 'my') {
        filtered = filtered.filter(tournament => isHost(tournament));
      } else if (creatorFilter === 'others') {
        filtered = filtered.filter(tournament => !isHost(tournament));
      }
    }

    setFilteredTournaments(filtered);
  }, [tournaments, searchTerm, gameTypeFilter, statusFilter, creatorFilter, user]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await listTournaments();
      setTournaments(response.tournaments || []);
      setError('');
    } catch (err) {
      setError('Failed to load tournaments');
      console.error('Fetch tournaments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeams = async () => {
    try {
      const response = await getUserTeams(user.id);
      setUserTeams(response.teams || []);
    } catch (err) {
      console.error('Fetch user teams error:', err);
    }
  };

  const fetchTournamentDetails = async (tournamentId) => {
    try {
      setLoading(true);
      const [tournamentRes, entriesRes, matchesRes, leaderboardRes] = await Promise.all([
        getTournament(tournamentId),
        getTournamentEntries(tournamentId).catch(() => ({ entries: [] })),
        getTournamentMatches(tournamentId).catch(() => ({ matches: [] })),
        getTournamentLeaderboard(tournamentId).catch(() => ({ leaderboard: [] }))
      ]);

      setSelectedTournament(tournamentRes.tournament);
      setEntries(entriesRes.entries || []);
      setMatches(matchesRes.matches || []);
      setLeaderboard(leaderboardRes.leaderboard || []);
      setShowTournamentDetails(true);
    } catch (err) {
      setError('Failed to load tournament details');
      console.error('Tournament details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Format dates properly
      const tournamentData = {
        ...newTournament,
        startDate: new Date(newTournament.startDate).toISOString(),
        endDate: new Date(newTournament.endDate).toISOString(),
        registrationDeadline: newTournament.registrationDeadline 
          ? new Date(newTournament.registrationDeadline).toISOString() 
          : null
      };

      await createTournament(tournamentData);
      setShowCreateModal(false);
      setNewTournament({
        name: '',
        description: '',
        gameType: 'football',
        participationType: 'team',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        minTeams: 2,
        maxTeams: 16,
        pointsPerWin: 3,
        pointsPerDraw: 1,
        autoGenerateOnMinReached: false,
        entryPolicy: {
          autoApprove: false,
          hostApprovalRequired: true
        },
        logistics: {
          venue: '',
          venueGeo: null
        },
        location: '',
        geoLocation: null,
        rules: '',
        ageLimit: 0,
        entryCriteria: {
          teamSizeLimit: {
            min: 0,
            max: 0
          }
        }
      });
      fetchTournaments();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tournament');
      console.error('Create tournament error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async (tournamentId, teamId) => {
    try {
      setLoading(true);
      await joinTournament(tournamentId, teamId);
      setError('');
      alert('Join request sent successfully!');
      
      // Refresh tournament details if viewing
      if (selectedTournament && selectedTournament._id === tournamentId) {
        fetchTournamentDetails(tournamentId);
      }
    } catch (err) {
      console.error('Join tournament error:', err);
      
      // Handle specific validation errors with better user messages
      if (err.response?.data?.code === 'SPORT_TYPE_MISMATCH') {
        const errorData = err.response.data;
        setError(`❌ Sport Mismatch: Your team plays ${errorData.teamSport?.charAt(0).toUpperCase() + errorData.teamSport?.slice(1)} but this tournament is for ${errorData.tournamentSport?.charAt(0).toUpperCase() + errorData.tournamentSport?.slice(1)} teams only.`);
      } else if (err.response?.data?.failures || err.response?.data?.status === 'rejected') {
        // Handle eligibility validation failures with detailed context
        const failures = err.response.data.failures || [];
        const tournament = selectedTournament || tournaments.find(t => t._id === tournamentId);
        
        const getDetailedErrorMessage = (failure) => {
          switch (failure) {
            case 'age-below-min':
              const ageLimit = tournament?.ageLimit || tournament?.entryCriteria?.ageLimitMin;
              return `👤 Age Requirement: Some team members are below ${ageLimit ? `the minimum age of ${ageLimit} years` : 'the minimum age requirement'}`;
            
            case 'age-above-max':
              const maxAge = tournament?.entryCriteria?.ageLimitMax;
              return `👤 Age Limit: Some team members are above ${maxAge ? `the maximum age of ${maxAge} years` : 'the maximum age limit'}`;
            
            case 'team-too-small':
              const minSize = tournament?.entryCriteria?.teamSizeLimit?.min;
              return `👥 Team Size: Your team is too small (minimum ${minSize ? `${minSize} players` : 'size requirement not met'})`;
            
            case 'team-too-large':
              const maxSize = tournament?.entryCriteria?.teamSizeLimit?.max;
              return `👥 Team Size: Your team is too large (maximum ${maxSize ? `${maxSize} players` : 'size limit exceeded'})`;
            
            case 'gender-mismatch':
              const genderReq = tournament?.entryCriteria?.genderCategory;
              return `⚥ Gender Requirement: This tournament is for ${genderReq || 'specific gender'} participants only`;
            
            case 'tournament-full':
              const maxTeams = tournament?.maxTeams;
              return `🏆 Tournament Full: Maximum capacity reached (${maxTeams ? `${maxTeams} teams` : 'capacity limit met'})`;
            
            case 'sport-type-mismatch':
              return `⚽ Sport Mismatch: Tournament is for ${tournament?.gameType} teams only`;
            
            default: 
              return `❌ ${failure.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
          }
        };

        if (failures.length > 0) {
          const detailedMessages = failures.map(getDetailedErrorMessage);
          setError(`🚫 Team Registration Rejected:\n\n${detailedMessages.join('\n\n')}\n\n💡 Please update your team to meet the requirements and try again.`);
        } else {
          setError('❌ Team registration was rejected. Please check tournament requirements.');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to join tournament');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEntry = async (entryId) => {
    try {
      await approveEntry(selectedTournament._id, entryId);
      fetchTournamentDetails(selectedTournament._id);
      alert('Entry approved successfully!');
    } catch (err) {
      setError('Failed to approve entry');
      console.error('Approve entry error:', err);
    }
  };

  const handleRejectEntry = async (entryId) => {
    try {
      await rejectEntry(selectedTournament._id, entryId);
      fetchTournamentDetails(selectedTournament._id);
      alert('Entry rejected successfully!');
    } catch (err) {
      setError('Failed to reject entry');
      console.error('Reject entry error:', err);
    }
  };

  const handleGenerateFixtures = async () => {
    try {
      setLoading(true);
      await generateFixtures(selectedTournament._id, 'round-robin', {});
      fetchTournamentDetails(selectedTournament._id);
      alert('Fixtures generated successfully!');
    } catch (err) {
      setError('Failed to generate fixtures');
      console.error('Generate fixtures error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationData) => {
    if (locationData) {
      setNewTournament(prev => ({
        ...prev,
        location: locationData.name || locationData.address?.split(',')[0] || locationData.address,
        logistics: {
          ...prev.logistics,
          venue: locationData.name || locationData.address?.split(',')[0] || locationData.address
        },
        geoLocation: {
          type: 'Point',
          coordinates: locationData.coordinates,
          name: locationData.name,
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          pincode: locationData.pincode,
          placeId: locationData.placeId,
          types: locationData.types,
          rating: locationData.rating,
          phone: locationData.phone,
          website: locationData.website
        }
      }));
    } else {
      setNewTournament(prev => ({
        ...prev,
        location: '',
        logistics: {
          ...prev.logistics,
          venue: ''
        },
        geoLocation: null
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEntryStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Check if user is tournament host
  const isHost = (tournament) => {
    return tournament.host === user?.id || tournament.createdBy === user?.id;
  };

  // Get sports that support individual participation
  const getSportsWithIndividualSupport = () => {
    return ['tennis', 'badminton', 'table tennis'];
  };

  // Check if a sport supports individual participation
  const supportsIndividualPlay = (gameType) => {
    return getSportsWithIndividualSupport().includes(gameType?.toLowerCase());
  };

  // Check if user has eligible teams for tournament
  const getEligibleTeams = (tournament) => {
    if (tournament.participationType === 'individual') return [];
    return userTeams.filter(team => {
      const teamSport = team.sportType?.toLowerCase() || '';
      const tournamentSport = tournament.gameType?.toLowerCase() || '';
      return teamSport === tournamentSport;
    });
  };

  // Check if user has any teams for this sport
  const hasEligibleTeams = (tournament) => {
    return getEligibleTeams(tournament).length > 0;
  };

  // Check if user's teams meet tournament requirements with detailed feedback
  const checkTeamEligibility = (tournament, team) => {
    const issues = [];
    
    if (!team) return { eligible: false, issues: ['No team provided'] };

    // Sport type check
    const teamSport = team.sportType?.toLowerCase() || '';
    const tournamentSport = tournament.gameType?.toLowerCase() || '';
    if (teamSport !== tournamentSport) {
      issues.push(`Sport mismatch: Team plays ${team.sportType} but tournament is for ${tournament.gameType}`);
    }

    // Age requirements check
    if (tournament.ageLimit && tournament.ageLimit > 0) {
      const hasUnderageMembers = team.members?.some(member => {
        if (member.dob) {
          const age = Math.floor((Date.now() - new Date(member.dob)) / (365.25 * 24 * 60 * 60 * 1000));
          return age < tournament.ageLimit;
        }
        return false; // If no DOB, assume eligible
      });
      
      if (hasUnderageMembers) {
        issues.push(`Age requirement: Minimum age is ${tournament.ageLimit} years`);
      }
    }

    // Team size check
    const teamSize = team.members?.length || 0;
    const minSize = tournament.entryCriteria?.teamSizeLimit?.min;
    const maxSize = tournament.entryCriteria?.teamSizeLimit?.max;
    
    if (minSize && teamSize < minSize) {
      issues.push(`Team too small: Need at least ${minSize} players (currently ${teamSize})`);
    }
    if (maxSize && teamSize > maxSize) {
      issues.push(`Team too large: Maximum ${maxSize} players allowed (currently ${teamSize})`);
    }

    return {
      eligible: issues.length === 0,
      issues: issues
    };
  };

  // Check if user can join individually
  const canJoinIndividually = (tournament) => {
    return tournament.participationType === 'individual' || tournament.participationType === 'mixed';
  };

  // Check if user can join with teams
  const canJoinWithTeam = (tournament) => {
    return tournament.participationType === 'team' || tournament.participationType === 'mixed';
  };

  // Function to open location in Google Maps
  const openGoogleMaps = (tournament) => {
    if (tournament.geoLocation?.coordinates && tournament.geoLocation.coordinates[0] && tournament.geoLocation.coordinates[1]) {
      const [lng, lat] = tournament.geoLocation.coordinates;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
      window.open(googleMapsUrl, '_blank');
    } else if (tournament.logistics?.venue || tournament.location) {
      const location = tournament.logistics?.venue || tournament.location;
      const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view tournaments</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 relative overflow-hidden">
        {/* Sports pattern background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-green-600/5"></div>
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-yellow-400/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Tournaments</h1>
                  <p className="text-sm text-gray-600">Compete in sports tournaments</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} className="mr-2" />
              Create Tournament
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg mb-6 overflow-hidden">
            <div className="bg-red-100 px-4 py-2 border-b border-red-200">
              <h4 className="font-medium text-red-800 flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                Registration Error
              </h4>
            </div>
            <div className="px-4 py-3">
              <div className="text-red-700 whitespace-pre-line text-sm leading-relaxed">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
              <Search className="text-white" size={16} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Find Tournaments</h2>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tournaments by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={gameTypeFilter}
                onChange={(e) => setGameTypeFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="">🏃 All Sports</option>
                {gameTypes.map(type => (
                  <option key={type} value={type.toLowerCase()}>
                    {getSportIcon(type)} {type}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="">📊 All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'upcoming' ? '🔜' : status === 'ongoing' ? '⚡' : '✅'} {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setCreatorFilter('')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                creatorFilter === '' 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              🏆 All Tournaments
            </button>
            <button
              onClick={() => setCreatorFilter('my')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                creatorFilter === 'my' 
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              👑 My Tournaments ({tournaments.filter(t => isHost(t)).length})
            </button>
            <button
              onClick={() => setCreatorFilter('others')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                creatorFilter === 'others' 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              🌐 Others' Tournaments ({tournaments.filter(t => !isHost(t)).length})
            </button>
          </div>
        </div>

        {/* Tournament Summary */}
        {!loading && tournaments.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-purple-700">
                      {tournaments.filter(t => isHost(t)).length}
                    </span> Your Tournaments
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-700">
                      {tournaments.filter(t => !isHost(t)).length}
                    </span> Other Tournaments
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-700">
                      {filteredTournaments.length}
                    </span> Currently Showing
                  </span>
                </div>
              </div>
              {creatorFilter && (
                <button
                  onClick={() => setCreatorFilter('')}
                  className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  <X size={14} className="mr-1" />
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tournaments Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => (
              <div key={tournament._id} className={`bg-white rounded-lg shadow-sm border transition-all duration-300 transform hover:-translate-y-1 ${
                isHost(tournament) 
                  ? 'border-purple-300 hover:shadow-xl hover:border-purple-400' 
                  : 'border-gray-200 hover:shadow-lg'
              }`}>
                {/* Sport-themed header with gradient and host indicator */}
                <div className="relative">
                  <div className={`h-3 bg-gradient-to-r ${getSportColor(tournament.gameType)} rounded-t-lg`}></div>
                  {isHost(tournament) && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="text-white" size={12} />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                          {tournament.name}
                        </h3>
                        {isHost(tournament) && (
                          <div className="flex items-center px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-xs font-medium border border-purple-300">
                            <Crown size={12} className="mr-1" />
                            Host
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSportBadgeColor(tournament.gameType)}`}>
                          {getSportIcon(tournament.gameType)} {tournament.gameType?.charAt(0).toUpperCase() + tournament.gameType?.slice(1)}
                        </span>
                        {isHost(tournament) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300">
                            📊 Created by you
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getSportColor(tournament.gameType)} mr-3`}></div>
                        {tournament.participationType === 'individual' ? (
                          <User size={14} className="mr-2 text-purple-500" />
                        ) : (
                          <Trophy size={14} className="mr-2 text-yellow-500" />
                        )}
                        <span className="font-medium">
                          {tournament.participationType === 'individual' ? 'Individual' : 'Team'} Tournament
                        </span>
                      </div>
                      {!isHost(tournament) && (
                        <div className="flex items-center">
                          {tournament.participationType === 'individual' ? (
                            <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                              <CheckCircle size={12} className="mr-1" />
                              Can Join
                            </div>
                          ) : hasEligibleTeams(tournament) ? (
                            <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                              <CheckCircle size={12} className="mr-1" />
                              Eligible
                            </div>
                          ) : userTeams.length > 0 ? (
                            <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                              <XCircle size={12} className="mr-1" />
                              No match
                            </div>
                          ) : (
                            <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                              <User size={12} className="mr-1" />
                              Need team
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2 text-blue-500" />
                      <span className="font-medium mr-1">Dates:</span>
                      {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      {tournament.participationType === 'individual' ? (
                        <User size={14} className="mr-2 text-purple-500" />
                      ) : (
                        <Users size={14} className="mr-2 text-green-500" />
                      )}
                      <span className="font-medium mr-1">
                        {tournament.participationType === 'individual' ? 'Players:' : 'Teams:'}
                      </span>
                      {tournament.minTeams}-{tournament.maxTeams} {tournament.participationType === 'individual' ? 'players' : 'teams'}
                    </div>
                    {tournament.logistics?.venue && (
                      <button
                        onClick={() => openGoogleMaps(tournament)}
                        className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group cursor-pointer w-full text-left"
                        title="Click to open in Google Maps"
                      >
                        <MapPin size={14} className="mr-2 text-red-500 group-hover:text-blue-500 flex-shrink-0" />
                        <span className="font-medium mr-1">Venue:</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium group-hover:text-blue-600 truncate">
                            {tournament.geoLocation?.name || tournament.logistics.venue}
                          </div>
                          {tournament.geoLocation?.address && (
                            <div className="text-xs text-gray-500 group-hover:text-blue-500 truncate">
                              {tournament.geoLocation.address}
                            </div>
                          )}
                        </div>
                      </button>
                    )}
                    {tournament.ageLimit > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User size={14} className="mr-2 text-purple-500" />
                        <span className="font-medium mr-1">Age Limit:</span>
                        {tournament.ageLimit} years
                      </div>
                    )}
                  </div>

                  {tournament.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tournament.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => fetchTournamentDetails(tournament._id)}
                      className={`flex-1 bg-gradient-to-r ${getSportColor(tournament.gameType)} text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center font-medium`}
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </button>
                    
                    {!isHost(tournament) && (
                      <>
                        {tournament.participationType === 'mixed' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleJoinTournament(tournament._id, 'individual')}
                              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium flex items-center text-sm"
                            >
                              <User size={14} className="mr-1" />
                              Singles
                            </button>
                            {hasEligibleTeams(tournament) ? (
                              <div className="relative">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleJoinTournament(tournament._id, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all appearance-none cursor-pointer font-medium text-sm"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Doubles</option>
                                  {getEligibleTeams(tournament).map(team => (
                                    <option key={team._id} value={team._id} className="bg-white text-black">
                                      {team.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="flex items-center px-2 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-lg text-xs">
                                <Users size={12} className="mr-1" />
                                <span>No doubles teams</span>
                              </div>
                            )}
                          </div>
                        ) : tournament.participationType === 'individual' ? (
                          <button
                            onClick={() => handleJoinTournament(tournament._id, 'individual')}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium flex items-center"
                          >
                            <User size={16} className="mr-2" />
                            Join as Individual
                          </button>
                        ) : hasEligibleTeams(tournament) ? (
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleJoinTournament(tournament._id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all appearance-none cursor-pointer font-medium"
                              defaultValue=""
                            >
                              <option value="" disabled>Join with Team</option>
                              {getEligibleTeams(tournament).map(team => {
                                const eligibility = checkTeamEligibility(tournament, team);
                                const warningText = eligibility.eligible ? '' : ` (⚠️ ${eligibility.issues.length} issue${eligibility.issues.length !== 1 ? 's' : ''})`;
                                return (
                                  <option 
                                    key={team._id} 
                                    value={team._id} 
                                    className={`bg-white ${eligibility.eligible ? 'text-black' : 'text-orange-600'}`}
                                    title={eligibility.eligible ? '' : eligibility.issues.join('; ')}
                                  >
                                    {getSportIcon(team.sportType || 'Other')} {team.name}{warningText}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        ) : userTeams.length > 0 ? (
                          <div className="flex items-center px-3 py-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-lg text-xs" title={`You need a ${tournament.gameType} team to join this tournament. Your teams: ${userTeams.map(t => `${t.name} (${t.sportType})`).join(', ')}`}>
                            <AlertCircle size={14} className="mr-1" />
                            <span>No {tournament.gameType} teams</span>
                          </div>
                        ) : (
                          <div className="flex items-center px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-lg text-xs">
                            <UserPlus size={14} className="mr-1" />
                            <span>Create a team first</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTournaments.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                creatorFilter === 'my' 
                  ? 'bg-gradient-to-r from-purple-400 to-purple-500'
                  : creatorFilter === 'others'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
              }`}>
                {creatorFilter === 'my' ? (
                  <Crown className="text-white" size={36} />
                ) : creatorFilter === 'others' ? (
                  <Users className="text-white" size={36} />
                ) : (
                  <Trophy className="text-white" size={36} />
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Search className="text-white" size={16} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              {creatorFilter === 'my' 
                ? "You haven't created any tournaments yet"
                : creatorFilter === 'others'
                ? "No tournaments from other users found"
                : "No tournaments found"
              }
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {creatorFilter === 'my' 
                ? "Create your first tournament to start organizing competitions and invite other players to join!"
                : creatorFilter === 'others'
                ? "Try adjusting your search or other filters to find tournaments created by other users."
                : "Try adjusting your search or filters, or create a new tournament to get started."
              }
            </p>
            {creatorFilter === 'my' ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} className="mr-2" />
                Create Your First Tournament
              </button>
            ) : (
              <div className="flex justify-center space-x-2">
                {gameTypes.slice(0, 6).map(sport => (
                  <span key={sport} className="text-2xl" title={sport}>
                    {getSportIcon(sport)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Create New Tournament</h2>
                  <p className="text-sm text-gray-600">Set up your sports tournament</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTournament.name}
                  onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tournament name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTournament.description}
                  onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tournament description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Type * {getSportIcon(newTournament.gameType)}
                  </label>
                  <select
                    required
                    value={newTournament.gameType}
                    onChange={(e) => {
                      const gameType = e.target.value;
                      setNewTournament({
                        ...newTournament, 
                        gameType,
                        // Reset participation type when sport changes
                        participationType: supportsIndividualPlay(gameType) ? newTournament.participationType : 'team'
                      });
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      newTournament.gameType 
                        ? `border-gray-300 focus:border-${getSportColor(newTournament.gameType).split('-')[1]}-400 focus:ring-${getSportColor(newTournament.gameType).split('-')[1]}-200`
                        : 'border-gray-300 focus:border-blue-400 focus:ring-blue-200'
                    }`}
                  >
                    {gameTypes.map(type => (
                      <option key={type} value={type.toLowerCase()}>
                        {getSportIcon(type)} {type}
                      </option>
                    ))}
                  </select>
                  {newTournament.gameType && (
                    <div className={`mt-2 p-2 rounded-lg bg-gradient-to-r ${getSportColor(newTournament.gameType)} bg-opacity-10`}>
                      <span className={`text-sm font-medium ${getSportBadgeColor(newTournament.gameType).split(' ')[1]}`}>
                        {getSportIcon(newTournament.gameType)} Selected: {newTournament.gameType.charAt(0).toUpperCase() + newTournament.gameType.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Limit (0 = No limit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTournament.ageLimit}
                    onChange={(e) => setNewTournament({...newTournament, ageLimit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Team Size Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Team Size Requirements
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Minimum Players (0 = No limit)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={newTournament.entryCriteria?.teamSizeLimit?.min || 0}
                      onChange={(e) => setNewTournament({
                        ...newTournament,
                        entryCriteria: {
                          ...newTournament.entryCriteria,
                          teamSizeLimit: {
                            ...newTournament.entryCriteria?.teamSizeLimit,
                            min: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Maximum Players (0 = No limit)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={newTournament.entryCriteria?.teamSizeLimit?.max || 0}
                      onChange={(e) => setNewTournament({
                        ...newTournament,
                        entryCriteria: {
                          ...newTournament.entryCriteria,
                          teamSizeLimit: {
                            ...newTournament.entryCriteria?.teamSizeLimit,
                            max: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., 11"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Set team size limits to ensure fair competition (e.g., Football: 5-11 players)
                </p>
              </div>

              {/* Participation Type Selection */}
              {supportsIndividualPlay(newTournament.gameType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Participation Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        newTournament.participationType === 'team'
                          ? `border-blue-500 bg-blue-50`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setNewTournament({...newTournament, participationType: 'team'})}
                    >
                      <input
                        type="radio"
                        name="participationType"
                        value="team"
                        checked={newTournament.participationType === 'team'}
                        onChange={() => setNewTournament({...newTournament, participationType: 'team'})}
                        className="absolute top-3 right-3"
                      />
                      <div className="flex items-center mb-2">
                        <Users size={18} className="mr-2 text-blue-600" />
                        <span className="font-medium text-gray-800 text-sm">Teams Only</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Only teams/doubles can participate
                      </p>
                    </div>

                    <div
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        newTournament.participationType === 'individual'
                          ? `border-green-500 bg-green-50`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setNewTournament({...newTournament, participationType: 'individual'})}
                    >
                      <input
                        type="radio"
                        name="participationType"
                        value="individual"
                        checked={newTournament.participationType === 'individual'}
                        onChange={() => setNewTournament({...newTournament, participationType: 'individual'})}
                        className="absolute top-3 right-3"
                      />
                      <div className="flex items-center mb-2">
                        <User size={18} className="mr-2 text-green-600" />
                        <span className="font-medium text-gray-800 text-sm">Singles Only</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Only individual players can participate
                      </p>
                    </div>

                    <div
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        newTournament.participationType === 'mixed'
                          ? `border-purple-500 bg-purple-50`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setNewTournament({...newTournament, participationType: 'mixed'})}
                    >
                      <input
                        type="radio"
                        name="participationType"
                        value="mixed"
                        checked={newTournament.participationType === 'mixed'}
                        onChange={() => setNewTournament({...newTournament, participationType: 'mixed'})}
                        className="absolute top-3 right-3"
                      />
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          <User size={16} className="text-purple-600" />
                          <Users size={16} className="text-purple-600 -ml-1" />
                        </div>
                        <span className="font-medium text-gray-800 text-sm">Both</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Singles & doubles categories
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle size={16} className="text-yellow-600 mr-2 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-medium text-yellow-800">
                          {newTournament.participationType === 'individual' 
                            ? '👤 Singles Tournament:' 
                            : newTournament.participationType === 'team'
                            ? '👥 Doubles Tournament:'
                            : '🏆 Mixed Tournament:'
                          }
                        </span>
                        <span className="text-yellow-700 ml-1">
                          {newTournament.participationType === 'individual'
                            ? 'Players can join directly. Perfect for singles matches!'
                            : newTournament.participationType === 'team'
                            ? 'Teams (doubles pairs) compete. Players must form teams.'
                            : 'Both individual players AND teams can participate! Separate singles and doubles categories.'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newTournament.startDate}
                    onChange={(e) => setNewTournament({...newTournament, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newTournament.endDate}
                    onChange={(e) => setNewTournament({...newTournament, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  value={newTournament.registrationDeadline}
                  onChange={(e) => setNewTournament({...newTournament, registrationDeadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min {newTournament.participationType === 'individual' ? 'Players' : 'Teams'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="2"
                    value={newTournament.minTeams}
                    onChange={(e) => setNewTournament({...newTournament, minTeams: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Minimum ${newTournament.participationType === 'individual' ? 'players' : 'teams'} required`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max {newTournament.participationType === 'individual' ? 'Players' : 'Teams'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="2"
                    value={newTournament.maxTeams}
                    onChange={(e) => setNewTournament({...newTournament, maxTeams: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Maximum ${newTournament.participationType === 'individual' ? 'players' : 'teams'} allowed`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Per Win
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newTournament.pointsPerWin}
                    onChange={(e) => setNewTournament({...newTournament, pointsPerWin: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Per Draw
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newTournament.pointsPerDraw}
                    onChange={(e) => setNewTournament({...newTournament, pointsPerDraw: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Location *
                </label>
                <LocationInput
                  value={newTournament.geoLocation ? {
                    name: newTournament.geoLocation.name,
                    address: newTournament.geoLocation.address || newTournament.location,
                    coordinates: newTournament.geoLocation.coordinates,
                    lat: newTournament.geoLocation.coordinates?.[1],
                    lng: newTournament.geoLocation.coordinates?.[0]
                  } : null}
                  onChange={handleLocationSelect}
                  placeholder="Enter tournament venue, stadium, ground, or address..."
                  required={false}
                />
                {newTournament.location && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-sm text-green-800">
                      <MapPin size={14} className="mr-2" />
                      <span className="font-medium">Selected venue: </span>
                      <span className="ml-1">{newTournament.location}</span>
                    </div>
                    {newTournament.geoLocation?.address && (
                      <div className="text-xs text-green-600 mt-1 ml-5">
                        {newTournament.geoLocation.address}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rules
                </label>
                <textarea
                  value={newTournament.rules}
                  onChange={(e) => setNewTournament({...newTournament, rules: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tournament rules and regulations"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTournament.autoGenerateOnMinReached}
                    onChange={(e) => setNewTournament({
                      ...newTournament,
                      autoGenerateOnMinReached: e.target.checked
                    })}
                    className="mr-2"
                  />
                  Auto-generate fixtures when minimum {newTournament.participationType === 'individual' ? 'players' : 'teams'} reached
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTournament.entryPolicy.autoApprove}
                    onChange={(e) => setNewTournament({
                      ...newTournament,
                      entryPolicy: {
                        ...newTournament.entryPolicy,
                        autoApprove: e.target.checked,
                        hostApprovalRequired: !e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  Auto-approve {newTournament.participationType === 'individual' ? 'player' : 'team'} entries
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t bg-gray-50 px-6 py-4 -mx-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center ${
                    newTournament.gameType 
                      ? `bg-gradient-to-r ${getSportColor(newTournament.gameType)} hover:shadow-lg transform hover:-translate-y-0.5`
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Trophy size={16} className="mr-2" />
                      Create Tournament
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tournament Details Modal */}
      {showTournamentDetails && selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Sport-themed header */}
            <div className={`h-2 bg-gradient-to-r ${getSportColor(selectedTournament.gameType)} rounded-t-lg`}></div>
            
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getSportColor(selectedTournament.gameType)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {getSportIcon(selectedTournament.gameType)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedTournament.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSportBadgeColor(selectedTournament.gameType)}`}>
                      {selectedTournament.gameType?.charAt(0).toUpperCase() + selectedTournament.gameType?.slice(1)}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTournament.status)}`}>
                      {selectedTournament.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTournamentDetails(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tournament Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Trophy className="mr-2 text-yellow-500" size={20} />
                    Tournament Details
                  </h3>
                  
                  <div className="space-y-3 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSportColor(selectedTournament.gameType)} mr-3`}></div>
                        <Play size={16} className="mr-2 text-gray-600" />
                        <span className="font-medium text-gray-700">Game Type:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSportBadgeColor(selectedTournament.gameType)}`}>
                          {getSportIcon(selectedTournament.gameType)} {selectedTournament.gameType?.charAt(0).toUpperCase() + selectedTournament.gameType?.slice(1)}
                        </span>
                      </div>
                      {!isHost(selectedTournament) && (
                        <div className="text-xs">
                          {selectedTournament.participationType === 'mixed' ? (
                            <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                              🏆 Can join both ways
                            </span>
                          ) : selectedTournament.participationType === 'individual' ? (
                            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                              👤 Can join as individual
                            </span>
                          ) : hasEligibleTeams(selectedTournament) ? (
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                              ✅ {getEligibleTeams(selectedTournament).length} eligible team{getEligibleTeams(selectedTournament).length !== 1 ? 's' : ''}
                            </span>
                          ) : userTeams.length > 0 ? (
                            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                              ⚠️ Only {selectedTournament.gameType} teams allowed
                            </span>
                          ) : (
                            <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                              📝 Create a {selectedTournament.gameType} team first
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-sm">
                      {selectedTournament.participationType === 'individual' ? (
                        <User size={16} className="mr-2 text-purple-500" />
                      ) : selectedTournament.participationType === 'mixed' ? (
                        <div className="flex mr-2">
                          <User size={14} className="text-purple-500" />
                          <Users size={14} className="text-purple-500 -ml-1" />
                        </div>
                      ) : (
                        <Users size={16} className="mr-2 text-blue-500" />
                      )}
                      <span className="font-medium">Participation:</span>
                      <span className="ml-2 capitalize">
                        {selectedTournament.participationType === 'individual' ? 'Individual Players' : 
                         selectedTournament.participationType === 'mixed' ? 'Singles & Doubles' : 'Team Competition'}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTournament.participationType === 'individual' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : selectedTournament.participationType === 'mixed'
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {selectedTournament.participationType === 'individual' ? '👤 Singles' : 
                         selectedTournament.participationType === 'mixed' ? '🏆 Both' : '👥 Doubles'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      <span className="font-medium">Duration:</span>
                      <span className="ml-2">{formatDate(selectedTournament.startDate)} - {formatDate(selectedTournament.endDate)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users size={16} className="mr-2 text-gray-500" />
                      <span className="font-medium">Teams:</span>
                      <span className="ml-2">{selectedTournament.minTeams}-{selectedTournament.maxTeams}</span>
                    </div>
                    {selectedTournament.logistics?.venue && (
                      <button
                        onClick={() => openGoogleMaps(selectedTournament)}
                        className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group cursor-pointer w-full text-left"
                        title="Click to open in Google Maps"
                      >
                        <MapPin size={16} className="mr-2 text-red-500 group-hover:text-blue-500 flex-shrink-0" />
                        <span className="font-medium mr-2">Venue:</span>
                        <div className="flex-1">
                          <div className="font-medium group-hover:text-blue-600">
                            {selectedTournament.geoLocation?.name || selectedTournament.logistics.venue}
                          </div>
                          {selectedTournament.geoLocation?.address && (
                            <div className="text-xs text-gray-500 group-hover:text-blue-500">
                              {selectedTournament.geoLocation.address}
                            </div>
                          )}
                        </div>
                      </button>
                    )}
                    {selectedTournament.ageLimit > 0 && (
                      <div className="flex items-center text-sm">
                        <User size={16} className="mr-2 text-gray-500" />
                        <span className="font-medium">Age Limit:</span>
                        <span className="ml-2">{selectedTournament.ageLimit} years</span>
                      </div>
                    )}
                  </div>

                  {selectedTournament.description && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{selectedTournament.description}</p>
                    </div>
                  )}

                  {selectedTournament.rules && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Rules</h4>
                      <p className="text-sm text-gray-600">{selectedTournament.rules}</p>
                    </div>
                  )}

                  {/* Participation Requirements Info */}
                  <div className={`p-3 rounded-lg border-l-4 ${
                    selectedTournament.participationType === 'individual' || hasEligibleTeams(selectedTournament) 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-orange-50 border-orange-400'
                  }`}>
                    <h4 className="font-medium text-gray-700 mb-1 flex items-center">
                      {getSportIcon(selectedTournament.gameType)} Participation Requirements
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedTournament.participationType === 'individual' ? (
                        <>
                          This is an <span className="font-medium">individual {selectedTournament.gameType}</span> tournament (singles only).
                          {!isHost(selectedTournament) && (
                            <span className="text-green-700"> 👤 You can join directly as an individual player!</span>
                          )}
                        </>
                      ) : selectedTournament.participationType === 'mixed' ? (
                        <>
                          This is a <span className="font-medium">mixed {selectedTournament.gameType}</span> tournament with both singles and doubles categories.
                          {!isHost(selectedTournament) && (
                            <>
                              <span className="text-purple-700"> 🏆 You can join both as an individual (singles) AND with a team (doubles)!</span>
                              {hasEligibleTeams(selectedTournament) ? (
                                <span className="text-green-700"> ✅ You have {getEligibleTeams(selectedTournament).length} eligible doubles team{getEligibleTeams(selectedTournament).length !== 1 ? 's' : ''}.</span>
                              ) : (
                                <span className="text-blue-700"> 💡 Create a {selectedTournament.gameType} team to also participate in doubles.</span>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          This is a <span className="font-medium">team {selectedTournament.gameType}</span> tournament (doubles only).
                          {!isHost(selectedTournament) && (
                            <>
                              {hasEligibleTeams(selectedTournament) ? (
                                <span className="text-green-700"> ✅ You have {getEligibleTeams(selectedTournament).length} eligible team{getEligibleTeams(selectedTournament).length !== 1 ? 's' : ''}.</span>
                              ) : userTeams.length > 0 ? (
                                <span className="text-orange-700"> ⚠️ Your current teams play different sports.</span>
                              ) : (
                                <span className="text-gray-700"> 📝 Create a {selectedTournament.gameType} team to participate.</span>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Team Eligibility Checker */}
                {!isHost(selectedTournament) && userTeams.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Team Eligibility Check
                    </h4>
                    <div className="space-y-2">
                      {userTeams
                        .filter(team => team.sportType?.toLowerCase() === selectedTournament.gameType?.toLowerCase())
                        .map(team => {
                          const eligibility = checkTeamEligibility(selectedTournament, team);
                          return (
                            <div key={team._id} className={`p-3 rounded-lg border ${
                              eligibility.eligible 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-orange-50 border-orange-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-800">{team.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  eligibility.eligible
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {eligibility.eligible ? '✅ Eligible' : `⚠️ ${eligibility.issues.length} Issue${eligibility.issues.length !== 1 ? 's' : ''}`}
                                </span>
                              </div>
                              {!eligibility.eligible && (
                                <ul className="text-xs text-orange-700 space-y-1">
                                  {eligibility.issues.map((issue, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="mr-1">•</span>
                                      <span>{issue}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <div className="text-xs text-gray-600 mt-2">
                                {team.members?.length || 0} players • Ages: {
                                  team.members?.length > 0 
                                    ? team.members.map(member => {
                                        if (member.dob) {
                                          const age = Math.floor((Date.now() - new Date(member.dob)) / (365.25 * 24 * 60 * 60 * 1000));
                                          return age;
                                        }
                                        return 'N/A';
                                      }).join(', ')
                                    : 'No members'
                                }
                              </div>
                            </div>
                          );
                        })}
                      
                      {userTeams.filter(team => team.sportType?.toLowerCase() === selectedTournament.gameType?.toLowerCase()).length === 0 && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                          <p className="text-sm text-gray-600">
                            No {selectedTournament.gameType} teams found. Create a {selectedTournament.gameType} team to participate.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Entries & Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Team Entries</h3>
                    {isHost(selectedTournament) && entries.length >= selectedTournament.minTeams && (
                      <button
                        onClick={handleGenerateFixtures}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Generate Fixtures
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {entries.length === 0 ? (
                      <p className="text-gray-500 text-sm">No team entries yet</p>
                    ) : (
                      entries.map(entry => (
                        <div key={entry._id} className={`p-3 border rounded-lg ${entry.status === 'rejected' ? 'border-red-200 bg-red-50' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{entry.team?.name || 'Team'}</h4>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEntryStatusColor(entry.status)}`}>
                                  {entry.status}
                                </span>
                              </div>
                              {entry.status === 'rejected' && entry.eligibilityFailures && entry.eligibilityFailures.length > 0 && (
                                <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded">
                                  <p className="text-xs font-medium text-red-800 mb-1">Rejection Reasons:</p>
                                  <ul className="text-xs text-red-700 space-y-1">
                                    {entry.eligibilityFailures.map((failure, index) => {
                                      const reasonText = (() => {
                                        switch (failure) {
                                          case 'age-below-min': return 'Some team members are below minimum age requirement';
                                          case 'age-above-max': return 'Some team members are above maximum age limit';
                                          case 'team-too-small': return 'Team has too few members';
                                          case 'team-too-large': return 'Team has too many members';
                                          case 'gender-mismatch': return 'Team does not meet gender requirements';
                                          case 'sport-type-mismatch': return 'Team sport does not match tournament sport';
                                          default: return failure.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        }
                                      })();
                                      return (
                                        <li key={index} className="flex items-start">
                                          <span className="mr-1 mt-0.5">•</span>
                                          <span>{reasonText}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                            </div>
                            {isHost(selectedTournament) && entry.status === 'pending' && (
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleApproveEntry(entry._id)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CheckCircle size={20} />
                                </button>
                                <button
                                  onClick={() => handleRejectEntry(entry._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XCircle size={20} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {leaderboard.length > 0 && (
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className={`p-4 rounded-lg border-2 border-yellow-300 bg-gradient-to-r ${getSportColor(selectedTournament.gameType)} bg-opacity-10 hover:bg-opacity-20 transition-all group`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="text-yellow-600 group-hover:text-yellow-700" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">View Leaderboard</h4>
                    <p className="text-sm text-gray-600">{leaderboard.length} teams ranked</p>
                  </button>
                )}

                {matches.length > 0 && (
                  <button
                    onClick={() => setShowMatches(true)}
                    className={`p-4 rounded-lg border-2 border-blue-300 bg-gradient-to-r ${getSportColor(selectedTournament.gameType)} bg-opacity-10 hover:bg-opacity-20 transition-all group`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="text-blue-600 group-hover:text-blue-700" size={24} />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">View Schedule</h4>
                    <p className="text-sm text-gray-600">{matches.length} matches scheduled</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Sport-themed header */}
            <div className={`h-2 bg-gradient-to-r ${getSportColor(selectedTournament.gameType)} rounded-t-lg`}></div>
            
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Tournament Leaderboard</h2>
                  <p className="text-sm text-gray-600">{selectedTournament.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSportBadgeColor(selectedTournament.gameType)}`}>
                    {getSportIcon(selectedTournament.gameType)} {selectedTournament.gameType?.charAt(0).toUpperCase() + selectedTournament.gameType?.slice(1)}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTournament.status)}`}>
                    {selectedTournament.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {leaderboard.length} teams participating
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-800 border-b">Rank</th>
                        <th className="text-left p-4 font-semibold text-gray-800 border-b">Team</th>
                        <th className="text-center p-4 font-semibold text-gray-800 border-b">Played</th>
                        <th className="text-center p-4 font-semibold text-gray-800 border-b">Won</th>
                        <th className="text-center p-4 font-semibold text-gray-800 border-b">Draw</th>
                        <th className="text-center p-4 font-semibold text-gray-800 border-b">Lost</th>
                        <th className="text-center p-4 font-semibold text-gray-800 border-b">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((team, index) => (
                        <tr key={team.teamId} className={`${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                          <td className="p-4 font-medium">
                            <div className="flex items-center">
                              {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                              {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                              {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                              {index > 2 && <span className="text-lg font-bold text-gray-500 mr-2">#{index + 1}</span>}
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-gray-800">
                            {team.teamName}
                          </td>
                          <td className="text-center p-4 text-gray-700">{team.played}</td>
                          <td className="text-center p-4 text-green-600 font-semibold">{team.won}</td>
                          <td className="text-center p-4 text-yellow-600 font-semibold">{team.draw}</td>
                          <td className="text-center p-4 text-red-600 font-semibold">{team.lost}</td>
                          <td className="text-center p-4 text-blue-600 font-bold text-lg">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No rankings yet</h3>
                  <p className="text-gray-500">Rankings will appear once matches are played</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Matches Schedule Modal */}
      {showMatches && selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Sport-themed header */}
            <div className={`h-2 bg-gradient-to-r ${getSportColor(selectedTournament.gameType)} rounded-t-lg`}></div>
            
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Tournament Schedule</h2>
                  <p className="text-sm text-gray-600">{selectedTournament.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMatches(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSportBadgeColor(selectedTournament.gameType)}`}>
                    {getSportIcon(selectedTournament.gameType)} {selectedTournament.gameType?.charAt(0).toUpperCase() + selectedTournament.gameType?.slice(1)}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTournament.status)}`}>
                    {selectedTournament.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {matches.length} matches scheduled
                </div>
              </div>

              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div key={match._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {match.homeTeam?.name || 'Team A'} vs {match.awayTeam?.name || 'Team B'}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              <span>{match.scheduledAt ? formatDate(match.scheduledAt) : 'TBD'}</span>
                            </div>
                            {match.venue && (
                              <div className="flex items-center">
                                <MapPin size={14} className="mr-1" />
                                <span>{match.venue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {match.status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            match.status === 'completed' ? 'bg-green-100 text-green-800' :
                            match.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.status}
                          </span>
                        )}
                        {match.result && (
                          <div className="text-sm font-semibold text-gray-800 mt-1">
                            {match.result.homeScore} - {match.result.awayScore}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {match.round && (
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                        Round {match.round}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {matches.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No matches scheduled</h3>
                  <p className="text-gray-500">Match fixtures will appear once the tournament begins</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
