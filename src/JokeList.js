import React, { Component } from 'react';
import axios from 'axios';
import Joke from './Joke';
import { v4 as uuid } from 'uuid';
import './JokeList.css';
import FlipMove from 'react-flip-move';

export default class JokeList extends Component {
  static defaultProps = {
    numberOfJokesToGet: 10
  };

  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map(joke => joke.text));
    console.log(this.seenJokes);
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  getJokes = async () => {
    try {
      let jokes = [];
      while (jokes.length < this.props.numberOfJokesToGet) {
        let res = await axios.get('https://icanhazdadjoke.com/', {
          headers: { Accept: 'application/json' }
        });
        let newJoke = res.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          jokes.push({ id: uuid(), text: res.data.joke, votes: 0 });
        } else {
          console.log('Found a duplicate joke!');
          console.log(newJoke);
        }
      }
      this.setState(
        prevState => ({
          loading: false,
          jokes: [...prevState.jokes, ...jokes]
        }),
        () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
      );
    } catch (error) {
      alert(error);
      this.setState({ loading: false });
    }
  };

  handleVote = (id, delta) => {
    this.setState(
      prevState => ({
        jokes: prevState.jokes.map(
          joke => (joke.id === id ? { ...joke, votes: joke.votes + delta } : joke)
        )
      }),
      () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
    );
  };

  handleClick = () => {
    this.setState({ loading: true }, this.getJokes);
  };

  handleReset = () => {
    window.localStorage.clear();
    window.location.reload(false);
  };

  render() {
    if (this.state.loading) {
      return (
        <div className='JokeList-spinner'>
          <i className='far fa-10x fa-laugh fa-spin' />
          <h1 className='JokeList-title'>Loading...</h1>
        </div>
      );
    }
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className='JokeList'>
        <div className='JokeList-sidebar'>
          <h1 className='JokeList-title'>
            <span>Dad</span> Jokes!
          </h1>
          <img
            src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'
            alt='smiley'
          />
          <button className='JokeList-getmore' onClick={this.handleClick}>
            Add Jokes
          </button>
          <button className='JokeList-clear' onClick={this.handleReset}>
            Reset Jokes
          </button>
        </div>
        <div className='JokeList-jokes'>
          <FlipMove>
            {jokes.map(joke => (
              <Joke
                key={joke.id}
                id={joke.id}
                votes={joke.votes}
                text={joke.text}
                upvote={() => this.handleVote(joke.id, 1)}
                downvote={() => this.handleVote(joke.id, -1)}
              />
            ))}
          </FlipMove>
        </div>
      </div>
    );
  }
}
